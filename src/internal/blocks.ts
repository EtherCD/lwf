import { SchemaValue, WriteStackValue } from '../types'
import { ReadContext, WriteContext } from './context'
import { Empty, UVarInt32, Value } from './vars'

export const Block = {
    write(this: WriteContext, element: WriteStackValue) {
        const index = element[1] !== null ? element[1] : 0
        const schema = this.schema.get(index)
        let object = element[0]

        if (Array.isArray(object)) {
            let values: Array<unknown> = object as Array<unknown>

            if (!schema.isArray) throw new Error('TODO: Make Errors')

            let containValues = false
            let buf: Array<unknown> | undefined

            if (values.length === 0) return

            if (element[2]) {
                UVarInt32.write.call(this, index)
                UVarInt32.write.call(this, values.length)
            }

            for (let i = values.length - 1; i >= 0; i--) {
                const val = object[i]
                if (!element[2])
                    if (typeof val === 'object' && val !== null) {
                        if (buf) {
                            this.stack.add(buf, index, true)
                            buf = undefined
                        }
                        this.stack.add(val, index)
                    } else {
                        if (schema.canContainNotObjects) {
                            if (!buf) buf = [val]
                            else buf.push(val)
                        }
                        containValues = true
                    }
                else Value.write.call(this, val)
            }

            if (buf) this.stack.add(buf, index, true)

            if (containValues && !schema.canContainNotObjects)
                throw new Error('TODO: Make Errors')
            return
        } else if (schema.isKeyedObject && !element[3]) {
            const keys = Object.keys(object)

            for (const key of keys) {
                this.stack.add(object[key], index, null, key)
            }

            return
        }

        UVarInt32.write.call(this, index)
        if (element[3]) Value.write.call(this, element[3])

        const args = schema.args
        const objects = schema.includesObjects

        if (schema.canContainNotObjects) this.write(0x00)

        const objectKeys = new Set(Object.keys(object))

        let a = 0
        if (args)
            while (a < args.length) {
                let field = args[a]

                if (objectKeys.has(field as string)) {
                    const value = object[field]

                    if (typeof value === 'object' && value !== null) {
                        throw new Error(
                            'Error, unexpected use of object in list `args` schema'
                        )
                    } else Value.write.call(this, value)

                    a++
                    continue
                }

                let count = 1
                while (
                    a + count < args.length &&
                    !objectKeys.has(args[a + count] as string)
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

                if (typeof value === 'object' && value !== null) {
                    this.stack.add(value, schema.includesIndexes[a])
                } else
                    throw new Error(
                        'Error, unexpected use of non-Object value in `includes` schema'
                    )
            }

            a--
        }
    },
    read(this: ReadContext) {
        const index = UVarInt32.read.call(this) as number

        let schema = this.schema.get(index)

        let key: string

        if (!schema) return

        if (schema.isArray) {
            if (this.lastIndex !== index) {
                this.nesting(schema, index)
                this.startArray()
            }

            if (schema.canContainNotObjects && this.peek() !== 0) {
                const length = UVarInt32.read.call(this)

                for (let i = 0; i < length; i++)
                    this.stack.addValueToArray(Value.read.call(this))

                return
            } else {
                if (schema.canContainNotObjects) this.read()
                this.stack.addObjectToArray()
            }
        } else {
            this.endArray()
            this.nesting(schema, index)
            if (schema.isKeyedObject) {
                key = Value.read.call(this)
                this.stack.addObjectToObject(key)
            }
        }

        let a = 0
        const args = schema.args

        if (args)
            while (a < args.length) {
                let field = args[a]

                if (Empty.check.call(this)) {
                    const count = Empty.read.call(this)
                    a += count
                    continue
                }

                if (key)
                    this.stack.setValueToObject(
                        key,
                        field,
                        Value.read.call(this)
                    )
                else this.stack.setValue(field, Value.read.call(this))

                a++
            }
    },
}

/**


{ a: { b: true } }

nested = [ [ { a: { b: true } } ] ]
index =0

while (index < nested.length) {}

nested.push([{b:true}, 01])

 */
