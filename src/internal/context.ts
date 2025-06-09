import { SchemaValue } from "../types"
import { Schema } from "./schema"
import { ReadStack, WriteStack } from "./stack"

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
     * Writes byte to buffer
     * @param byte uint8
     */
    write(byte: number) {
        this.buffer[this.offset++] = byte & 0xff
    }

    /**
     * Reads byte from buffer
     * @returns uint8
     */
    read() {
        return this.buffer[this.offset++]
    }

    /**
     * Peeks current byte
     * @returns uint8
     */
    peek() {
        return this.buffer[this.offset]
    }

    /**
     * Expands the buffer if it cannot provide writing data.
     * @param count number of bytes to write
     */
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
    lastSchema: SchemaValue = null
    lastIndex: number = null

    constructor(buffer: Uint8Array | Buffer | ArrayBuffer, schema: Schema) {
        super(schema)
        this.buffer = new Uint8Array(buffer)
        this.stack = new ReadStack(schema.getSchema(0))
    }
}

export class ConvertContext extends Context {
    constructor(buffer: Uint8Array | Buffer | ArrayBuffer, schema: Schema) {
        super(schema)
        this.buffer = new Uint8Array(buffer)
    }
}
