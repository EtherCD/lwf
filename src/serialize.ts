import { SchemaError, SerializationError } from './errors'
import { RawSchema, WriteBlockContext } from './types'
import { processSchema } from './util'
import { Block } from './blocks'

export function serialize(obj: Object, schema: RawSchema) {
    // options = processOptions(options)
    var context: WriteBlockContext = {
        buffer: new Uint8Array(1),
        offset: 0,
        sOffset: 0,
        ensure(size) {
            if (this.offset + size > this.buffer.length) {
                let newBuffer = new Uint8Array(this.buffer.length * 2 + size)
                newBuffer.set(this.buffer)
                this.buffer = newBuffer
            }
        },
        write(byte) {
            this.buffer[this.offset++] = byte
        },
        read() {
            return this.buffer[this.offset++]
        },
        schema: processSchema(schema),
        nested: [[obj]],
    }

    let i = 0
    while (i < context.nested.length) {
        Block.write.call(context, context.nested[i][0], context.nested[i][1])
        i++
    }

    return context.buffer.slice(0, context.offset)
}
