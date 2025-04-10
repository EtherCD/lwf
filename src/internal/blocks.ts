import { EncodeError } from "../errors"
import { WriteStackValue } from "../types"
import { ReadContext, WriteContext } from "./context"
import { Empty, Uint, Value } from "./vars"

export const Block = {
    encode(this: WriteContext, element: WriteStackValue) {
        const index = element[1] !== null ? element[1] : 0
        const schema = this.schema.getSchema(index)

        const object = element[0]
        const isJustValues = element[2] ?? false
        const containLength = schema.isArray || schema.isMap
        const key = element[3]

        if (Array.isArray(object)) {
            let values: Array<unknown> = object as Array<unknown>

            if (!schema.isArray)
                throw new EncodeError(
                    "Unexpected handling of an object or value instead of an array, key " +
                        schema.key,
                    schema.key
                )

            if (values.length === 0) return

            // If the current list consists only of simple values, we write
            if (isJustValues) {
                Uint.encode.call(this, index)
                Uint.encode.call(this, values.length)
                for (let i = values.length - 1; i >= 0; i--)
                    Value.encode.call(this, values[i])
                return
            }

            let buf: Array<unknown> | undefined

            // We go through the elements of the array
            // If we find a simple value, we automatically add it to the buffer,
            // and next time we add it to the stack.
            for (let i = values.length - 1; i >= 0; i--) {
                const val = object[i]
                if (!isJustValues)
                    if (typeof val === "object" && val !== null) {
                        if (buf) {
                            this.stack.add(buf, index, true)
                            buf = undefined
                        }
                        this.stack.add(val, index)
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
                    this.stack.add(value, index, null, key)
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
        const objects = schema.nestedK

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

                    if (typeof value === "object" && value !== null) {
                        throw new EncodeError(
                            "Unexpected use of object in list `fields` schema",
                            field
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

        if (!objects) return

        a = objects.length - 1

        while (a >= 0) {
            let field = objects[a]

            if (objectKeys.has(field)) {
                const value = object[field]

                if (typeof value === "object" && value !== null) {
                    this.stack.add(value, schema.nestedI[a])
                } else
                    throw new EncodeError(
                        "Unexpected use of non-Object value in `nested` schema",
                        field
                    )
            }

            a--
        }
    },
    decode(this: ReadContext) {
        const index = Uint.decode.call(this) as number

        let schema
        try {
            schema = this.schema.getSchema(index)
        } catch (e) {
            let str = ""
            this.buffer
                .slice(this.offset - 20, this.offset + 19)
                .map((e) => void (str += e.toString(16) + " "))
            // console.log(str)
            //@ts-ignore
            // console.log(util.inspect(this.stack.result, false, null, true))
            throw e
        }

        const isArray = schema.isArray
        const isMap = schema.isMap
        const justValues = this.peek() === 0 ? false : true

        if (!schema) return

        // Exits from other not objects (arrays and maps)
        if (this.lastSchema)
            if (
                index !== this.lastIndex &&
                this.lastSchema.nestedI &&
                this.lastSchema.nestedI.includes(index)
            ) {
            } else {
                if (
                    (this.lastSchema.isArray || this.lastSchema.isMap) &&
                    !this.stack.isEqualsIndexes(index)
                )
                    this.stack.exit()

                this.stack.exit(
                    Math.abs(
                        schema.nestingDepth - this.lastSchema.nestingDepth
                    ) + 1
                )
            }

        if (isArray) {
            // If this is a new array, let's create it
            if (!this.stack.isArray || this.stack.current.key !== schema.key) {
                if (index !== 0) {
                    this.stack.enterArray(index, schema.key)
                }
            }
            //  If it contains only values, we read their length and write them to the array
            if (justValues) {
                const length = Uint.decode.call(this)

                for (let i = 0; i < length; i++)
                    this.stack.pushValue(Value.decode.call(this))

                const nextIndex = Uint.peek.call(this)
                const nextSchema = this.schema.getSchema(nextIndex)
                this.stack.exit(schema.nestingDepth - nextSchema.nestingDepth)

                this.lastIndex = index
                return
            } else {
                this.read() // Reads byte with 0
                this.stack.enterObject(index)
            }
        } else if (isMap) {
            if (!this.stack.isEqualsIndexes(index))
                this.stack.enterObject(index, schema.key)
            if (this.peek() !== 0) {
                const length = Uint.decode.call(this)

                for (let i = 0; i < length; i++)
                    this.stack.setField(
                        Value.decode.call(this),
                        Value.decode.call(this)
                    )
                return
            } else {
                this.read()
                const key = Value.decode.call(this)
                this.stack.enterObject(index, key)
            }
        } else {
            this.stack.enterObject(index, schema.key)
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

/**


{ a: { b: true } }

nested = [ [ { a: { b: true } } ] ]
index =0

while (index < nested.length) {}

nested.push([{b:true}, 01])

 */
