import { ReadBlockContext, VarsContext, WriteBlockContext } from './types'
import { Empty, UVarInt32, Value } from './vars'

export const Block = {
    write(this: WriteBlockContext, object: Object, overrideIndex?: number) {
        const index = overrideIndex ?? this.sOffset

        const schema = this.schema[index]
        if (!schema) throw new Error(`TODO: Make errors`)

        if (Array.isArray(object)) {
            if (!schema.isArray) throw new Error('TODO: Make Errors')

            let containValues = false
            let objectWrote = false
            let buf: Array<unknown> | undefined

            for (const i in object) {
                const element = object[i]
                if (typeof element === 'object' && element !== null) {
                    if (buf) {
                        this.nested.push([buf, index])
                        buf = undefined
                    }
                    this.nested.push([element, index])
                    objectWrote = true
                } else {
                    if (schema.arrayContainValues) {
                        if (!objectWrote) {
                            if (!containValues) {
                                UVarInt32.write.call(this, index)
                                this.write(0x01)
                            }
                            Value.write.call(this, element)
                        } else {
                            if (!buf) buf = [element]
                            else buf.push(element)
                        }
                    }
                    containValues = true
                }
            }

            if (buf) this.nested.push([buf, index])

            if (containValues && !schema.arrayContainValues)
                throw new Error('TODO: Make Errors')
            return
        }

        UVarInt32.write.call(this, index)

        const args = schema.args
        const objects = schema.includesObjects

        if (schema.arrayContainValues) this.write(0x00)

        let a = 0
        if (args)
            while (a < args.length) {
                let field = args[a]

                if (object[field] !== undefined) {
                    const value = object[field]

                    if (typeof value === 'object' && value !== null) {
                        throw new Error(
                            'Error, unexpected use of object in list `args` schema'
                        )
                    } else Value.write.call(this, value)

                    a++
                    continue
                }

                let f = a + 0
                let count = 0

                while (object[args[f]] === undefined && f < args.length) {
                    count++
                    f++
                }

                Empty.write.call(this, count)

                a += count
            }

        if (!objects) return

        a = 0

        while (a < objects.length) {
            let field = objects[a]

            if (object[field] !== undefined) {
                const value = object[field]

                if (typeof value === 'object' && value !== null) {
                    this.nested.push([value, schema.includesIndexes[a]])
                } else
                    throw new Error(
                        'Error, unexpected use of non-Object value in `includes` schema'
                    )
            }

            a++
        }
    },
    read(this: ReadBlockContext) {
        const index = UVarInt32.read.call(this)

        const schema = this.schema[index]
        if (!schema) throw new Error(`TODO: Make errors`)

        const args = schema.args

        if (schema.isArray && schema.arrayContainValues) {
        }
        const object = {}

        let a = 0
        while (a < args.length) {
            let field = args[a]

            if (Empty.check.call(this)) {
                const count = Empty.read.call(this)
                a += count
                continue
            }
            object[field] = Value.read.call(this)
            a++
        }

        return object
    },
}
