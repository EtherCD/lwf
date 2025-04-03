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
                this.write(0x01)
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
                        if (schema.arrayContainValues) {
                            if (!buf) buf = [val]
                            else buf.push(val)
                        }
                        containValues = true
                    }
                else Value.write.call(this, val)
            }

            if (containValues && !schema.arrayContainValues)
                throw new Error('TODO: Make Errors')
            return
        }

        UVarInt32.write.call(this, index)

        const args = schema.args
        const objects = schema.includesObjects

        if (schema.arrayContainValues) this.write(0x00)

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

        if (!schema) return

        if (schema.isArray) {
            if (this.lastNestingDepth !== schema.nestingDepth) {
                this.nesting(schema)
                this.stack.startArray()
            }
            this.stack.addObjectToArray()
        } else {
            if (this.stack.isLastArray()) this.stack.endArray()
            this.nesting(schema)
        }

        let a = 0
        const args = schema.args

        while (a < args.length) {
            let field = args[a]

            if (Empty.check.call(this)) {
                const count = Empty.read.call(this)
                a += count
                continue
            }

            this.stack.setValue(field, Value.read.call(this))
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
