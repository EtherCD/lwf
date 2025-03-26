import ieee754 from 'ieee754'
import { serialize } from './serialize'
import { SingleSchema, TypeByte, VarsContext } from './types'
import { processSchema } from './util'
import { UVarInt32, Value } from './vars'

var blockIndex = 0

var decoder = new TextDecoder()

var schemas: SingleSchema[]

var objects = []

var context = {
    buffer: new Uint8Array(1),
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
    schema: schemas,
}

export function testde() {
    const schema = {
        a: {
            args: ['name', 'age', 'verified', 'security', 'other'],
        },
        b: {
            key: 'skills',
            isArray: true,
        },
    }
    schemas = processSchema(schema)

    context.buffer = serialize(
        {
            name: 'EtherCD',
            age: 20.23,
            verified: true,
            other: 'Not1!!!',
        },
        schema
    )

    console.log(context.buffer)

    while (context.offset < context.buffer.length) {
        objects.push(deserializeBlock.call(context))
    }

    console.log(objects)
}

function deserializeBlock(this: VarsContext) {
    const index = UVarInt32.read.call(this)
    const schema = schemas[index] ?? undefined
    console.log(index)

    if (schema === undefined) throw new Error('Schema is not exists.')

    if (schema.isArray) {
    }

    const args = schema.args

    blockIndex = 0

    let outObject = {}

    for (; blockIndex < args.length; blockIndex++) {
        const key = args[blockIndex]

        if (this.buffer[this.offset] === TypeByte.Empty) {
            blockIndex += this.buffer[this.offset++]
        } else if (this.buffer[this.offset] === TypeByte.EmptyCount)
            blockIndex += this.buffer[(this.offset += 2)]

        outObject[key] = Value.read.call(this)
    }
    return outObject
}
