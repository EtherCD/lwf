import { SerializationError } from "../errors"
import { SchemaValue, WriteStackValue } from "../types"
import { ReadContext, WriteContext } from "./context"
import { Empty, UVarInt32, Value } from "./vars"

export const Block = {
    write(this: WriteContext, element: WriteStackValue) {
        const index = element[1] !== null ? element[1] : 0
        const schema = this.schema.getSchema(index)

        const object = element[0]
        const isJustValues = element[2] ?? false
        const containLength = schema.isArray || schema.isMap
        const key = element[3]

        if (Array.isArray(object)) {
            let values: Array<unknown> = object as Array<unknown>

            if (!schema.isArray)
                throw new SerializationError(
                    "Unexpected handling of an object or value instead of an array, key " +
                        schema.key
                )

            if (values.length === 0) return

            // If the current list consists only of simple values, we write
            if (isJustValues) {
                UVarInt32.write.call(this, index)
                UVarInt32.write.call(this, values.length)
                for (let i = values.length - 1; i >= 0; i--)
                    Value.write.call(this, values[i])
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
                else Value.write.call(this, val)
            }

            if (buf) this.stack.add(buf, index, true)

            return
        } else if (schema.isMap && !element[3]) {
            const keys = Object.keys(object)

            if (isJustValues) {
                UVarInt32.write.call(this, index)
                UVarInt32.write.call(this, keys.length)
                for (let i = keys.length - 1; i >= 0; i--) {
                    const key = keys[i]
                    Value.write.call(this, key)
                    Value.write.call(this, object[key])
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

        UVarInt32.write.call(this, index)

        const fields = schema.fields
        const objects = schema.nestedK

        const objectKeys = new Set(Object.keys(object))

        if (containLength)
            if (isJustValues) {
                UVarInt32.write.call(this, objectKeys.size)
            } else this.write(0)
        if (key) Value.write.call(this, key)

        let a = 0

        if (fields)
            while (a < fields.length) {
                let field = fields[a]

                if (objectKeys.has(field as string)) {
                    const value = object[field]

                    if (typeof value === "object" && value !== null) {
                        throw new SerializationError(
                            "Unexpected use of object in list `fields` schema"
                        )
                    } else Value.write.call(this, value)

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

                Empty.write.call(this, count)

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
                    throw new SerializationError(
                        "Unexpected use of non-Object value in `nested` schema"
                    )
            }

            a--
        }
    },
    read(this: ReadContext) {
        const index = UVarInt32.read.call(this) as number

        let schema = this.schema.getSchema(index)

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
                    this.stack.exitNotObject()

                this.stack.exit(
                    Math.abs(
                        schema.nestingDepth - this.lastSchema.nestingDepth
                    ) + 1
                )
            }

        if (isArray) {
            // If this is a new array, let's create it
            if (!this.stack.isArray || this.stack.currentKey !== schema.key) {
                if (index !== 0) {
                    this.stack.enterArray(index, schema.key)
                }
            }
            //  If it contains only values, we read their length and write them to the array
            if (justValues) {
                const length = UVarInt32.read.call(this)

                for (let i = 0; i < length; i++)
                    this.stack.pushValue(Value.read.call(this))

                const nextIndex = UVarInt32.peek.call(this)
                const nextSchema = this.schema.getSchema(nextIndex)
                this.stack.exit(schema.nestingDepth - nextSchema.nestingDepth)

                this.lastIndex = index
                return
            } else {
                this.read() // Reads byte with 0
                this.stack.enterObject()
            }
        } else if (isMap) {
            if (!this.stack.isEqualsIndexes(index))
                this.stack.enterMap(index, schema.key)
            if (this.peek() !== 0) {
                const length = UVarInt32.read.call(this)

                for (let i = 0; i < length; i++)
                    this.stack.setField(
                        Value.read.call(this),
                        Value.read.call(this)
                    )
                return
            } else {
                this.read()
                const key = Value.read.call(this)
                this.stack.enterObject(key)
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
                    const count = Empty.read.call(this)
                    a += count
                    continue
                }

                this.stack.setField(field, Value.read.call(this))

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
