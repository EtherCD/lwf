import { SchemaValue } from '../types'
import { Schema } from './schema'
import { ReadStack, WriteStack } from './stack'

export class Context {
    buffer: Uint8Array
    offset: number
    schema: Schema

    constructor(schema: Schema) {
        this.buffer = new Uint8Array(1024)
        this.offset = 0
        this.schema = schema
    }

    /**
     * Writes byte
     * @param byte number
     */
    write(byte: number) {
        this.buffer[this.offset++] = byte & 0xff
    }

    /**
     * Reads current byte
     */
    read() {
        return this.buffer[this.offset++]
    }

    /**
     * Peeks current byte
     */
    peek() {
        return this.buffer[this.offset]
    }

    ensure(count: number) {
        if (this.offset + count > this.buffer.length) {
            let newBuffer = new Uint8Array(this.buffer.length * 2 + count)
            newBuffer.set(this.buffer)
            this.buffer = newBuffer
        }
    }
}

export class WriteContext extends Context {
    stack: WriteStack

    constructor(schema: Schema, object: Object) {
        super(schema)
        this.stack = new WriteStack(object)
    }
}

export class ReadContext extends Context {
    stack: ReadStack
    lastNestingDepth = 0

    constructor(buffer: Uint8Array, schema: Schema) {
        super(schema)
        this.buffer = buffer
        this.stack = new ReadStack(schema.get(0))
    }

    enter(schema: SchemaValue) {
        if (schema.key && schema.key.length !== 0) {
            this.stack.enter(schema.key, schema.isArray)
        }
    }

    nesting(schema: SchemaValue) {
        if (schema.nestingDepth < this.lastNestingDepth) {
            this.stack.exit(this.lastNestingDepth - schema.nestingDepth + 1)
        }

        this.enter(schema)
        this.lastNestingDepth = schema.nestingDepth
    }
}
