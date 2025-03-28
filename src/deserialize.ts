import { Block } from './blocks'
import { ReadBlockContext, Schema, SingleSchema } from './types'
import { processSchema } from './util'

export function deserialize(
    data: Uint8Array | ArrayBuffer | Buffer,
    schema: Schema
) {
    // options = processOptions(options)
    var context: ReadBlockContext = {
        buffer: new Uint8Array(data),
        offset: 0,
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
        readBuffer: new Map(),
    }

    while (context.offset < context.buffer.length) {
        Block.read.call(context)
    }

    console.log(context.readBuffer)
}
