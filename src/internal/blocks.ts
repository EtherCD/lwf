import { EncodeError } from "../errors"
import { SchemaValue, TypeByte, WriteStackValue } from "../types"
import { ReadContext, WriteContext } from "./context"
import { Empty, EndOfBlock, Uint, Value } from "./vars"
import util from "util"

export const Block = {
    encode(this: WriteContext, element: WriteStackValue) {
        const index = element[1] !== undefined ? element[1] : 0
        const schema = this.schema.getSchema(index)

        const object = element[0] as any
        const isJustValues = element[2] ?? false
        const containLength = schema.isArray || schema.isMap
        const key = element[3]
        const nestingDepth = element[4]

        const writeEndOfBlock = () => {
            const diff = this.stack.prevDepth - nestingDepth

            let enc = 0
            if (diff >= 1) {
                enc += diff
                if (
                    (schema.isMap || schema.isArray) &&
                    !this.lastSchema.isArray &&
                    !this.lastSchema.isMap
                )
                    enc += 1
            }
            if (diff == 0) enc += 1

            if (
                this.lastSchema?.isMap &&
                this.lastSchema.nestedI &&
                !this.lastSchema.nestedI.includes(index)
            ) {
                EndOfBlock.encode.call(this, 1)
            }

            if (enc !== 0) {
                EndOfBlock.encode.call(this, enc)
            }

            if (nestingDepth !== undefined) this.stack.prevDepth = nestingDepth
        }

        writeEndOfBlock()

        if (Array.isArray(object)) {
            let values: Array<unknown> = object as Array<unknown>

            if (!schema.isArray) {
                console.log(schema, object, index)
                throw new EncodeError(
                    "Unexpected handling of an object or value instead of an array, key " +
                        schema.key
                )
            }

            if (values.length === 0) return

            if (isJustValues) {
                Uint.encode.call(this, index)
                Uint.encode.call(this, values.length)
                for (let i = values.length - 1; i >= 0; i--)
                    Value.encode.call(this, values[i])
                return
            }

            let buf: Array<unknown> | undefined

            for (let i = values.length - 1; i >= 0; i--) {
                const val = values[i]
                if (!isJustValues)
                    if (typeof val === "object" && val !== null) {
                        if (buf) {
                            this.stack.add(buf, index, true)
                            buf = undefined
                        }
                        this.stack.add(
                            val,
                            index,
                            undefined,
                            undefined,
                            nestingDepth + 2
                        )
                    } else {
                        if (!buf) buf = [val]
                        else buf.push(val)
                    }
                else Value.encode.call(this, val)
            }

            if (buf) this.stack.add(buf, index, true)

            return
        } else if (schema.isMap && !element[3]) {
            const keys = Object.keys(object)

            if (isJustValues) {
                Uint.encode.call(this, index)
                Uint.encode.call(this, keys.length)
                for (let i = keys.length - 1; i >= 0; i--) {
                    const key = keys[i]
                    Value.encode.call(this, key)
                    Value.encode.call(this, object[key])
                }
                return
            }

            let buf: Record<string, unknown> | undefined
            for (let i = keys.length - 1; i >= 0; i--) {
                const key = keys[i]
                const value = object[key]
                if (typeof value === "object" && value !== null) {
                    if (buf) {
                        this.stack.add(buf, index, true)
                        buf = undefined
                    }
                    this.stack.add(
                        value,
                        index,
                        undefined,
                        key,
                        nestingDepth + 2
                    )
                } else {
                    if (!buf) buf = {}
                    buf[key] = value
                }
            }

            if (buf) {
                this.stack.add(buf, index, true)
                buf = undefined
            }
            return
        }

        Uint.encode.call(this, index)

        const fields = schema.fields
        const nested = schema.nestedK

        const objectKeys = new Set(Object.keys(object))

        if (containLength)
            if (isJustValues) {
                Uint.encode.call(this, objectKeys.size)
            } else this.write(0)
        if (key) Value.encode.call(this, key)

        let a = 0

        if (fields)
            while (a < fields.length) {
                let field = fields[a]

                if (objectKeys.has(field as string)) {
                    const value = object[field]

                    if (typeof value === "object" && value !== undefined) {
                        throw new EncodeError(
                            "Unexpected use of object in list `fields` schema"
                        )
                    } else Value.encode.call(this, value)

                    a++
                    continue
                }

                let count = 1
                while (
                    a + count < fields.length &&
                    !objectKeys.has(fields[a + count] as string)
                ) {
                    count++
                }

                Empty.encode.call(this, count)

                a += count
            }

        if (nested) {
            a = nested.length - 1

            while (a >= 0) {
                let field = nested[a]

                if (objectKeys.has(field)) {
                    const value = object[field]

                    if (typeof value === "object" && value !== undefined) {
                        this.stack.add(
                            value,
                            schema.nestedI[a],
                            undefined,
                            undefined,
                            nestingDepth + 1
                        )
                    } else
                        throw new EncodeError(
                            "Unexpected use of non-Object value in `nested` schema"
                        )
                }

                a--
            }
        }

        this.lastSchema = schema
        this.lastIndex = index
    },
    decode(this: ReadContext) {
        while (EndOfBlock.check.call(this)) {
            const count = EndOfBlock.decode.call(this)
            this.stack.exit(count)
        }

        const index = Uint.decode.call(this) as number

        let schema: SchemaValue
        try {
            schema = this.schema.getSchema(index)
        } catch (e) {
            let str = ""
            this.buffer
                .slice(this.offset - 20, this.offset + 19)
                .map((e) => void (str += e.toString(16) + " "))
            console.log(str)
            throw e
        }

        const isArray = schema.isArray
        const isMap = schema.isMap
        const justValues = this.peek() === 0 ? false : true

        if (isArray && !schema) return

        if (isArray) {
            if (!this.stack.isArray || this.stack.currentKey !== schema.key) {
                if (index !== 0) this.stack.enterArray(index, schema.key)
            }

            if (justValues) {
                const length = Uint.decode.call(this)

                for (let i = 0; i < length; i++)
                    this.stack.pushValue(Value.decode.call(this))

                return
            } else {
                this.read()
                this.stack.enterObject()
            }
        } else if (isMap) {
            if (!this.stack.isMap || this.stack.currentKey !== schema.key) {
                this.stack.enterMap(index, schema.key)
            }
            if (this.peek() !== 0) {
                const length = Uint.decode.call(this)

                for (let i = 0; i < length; i++)
                    this.stack.setField(
                        Value.decode.call(this) + "",
                        Value.decode.call(this)
                    )
                return
            } else {
                this.read()
                const key = Value.decode.call(this)
                this.stack.enterObject(key + "")
            }
        } else {
            this.stack.enterObject(schema.key)
        }

        let a = 0
        const fields = schema.fields

        if (fields)
            while (a < fields.length) {
                let field = fields[a]

                if (Empty.check.call(this)) {
                    const count = Empty.decode.call(this)
                    a += count
                    continue
                }

                this.stack.setField(field, Value.decode.call(this))

                a++
            }

        this.lastIndex = index
        this.lastSchema = schema
    }
}
