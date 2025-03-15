import { serialize } from './serialize'
import { SingleSchema, TypeByte } from './types'
import { processSchema } from './util'

var buffer = new Uint8Array()
var bufferIndex = 0
var blockIndex = 0

var decoder = new TextDecoder()

var schemas: SingleSchema[]

var objects = []

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

    buffer = serialize(
        {
            name: 'EtherCD',
            age: 17,
            verified: true,
            other: 'Not1!!!',
            skills: ['programming', 'cumming'],
        },
        schema
    )

    while (bufferIndex < buffer.length) {
        objects.push(deserializeBlock())
    }

    console.log(objects)
}

function deserializeBlock() {
    const index = buffer[bufferIndex++]
    const schema = schemas[index] ?? undefined

    if (schema === undefined) throw new Error('Schema is not exists.')

    if (schema.isArray) {
    }

    const args = schema.args

    blockIndex = 0

    let outObject = {}

    for (; blockIndex < args.length; blockIndex++) {
        const key = args[blockIndex]

        if (buffer[bufferIndex] === TypeByte.Empty) {
            blockIndex += buffer[bufferIndex++]
        } else if (buffer[bufferIndex] === TypeByte.EmptyDepth)
            blockIndex += buffer[(bufferIndex += 2)]

        outObject[key] = deserializeValue()
    }
    return outObject
}

function deserializeValue() {
    switch (buffer[bufferIndex++]) {
        case TypeByte.Int:
            return deserializeInt()
        case TypeByte.String:
            return deserializeString()
        case TypeByte.Bool:
            return deserializeBool()
        default:
            throw new Error('asdas')
    }
}

function deserializeInt() {
    let result = 0
    let shift = 0
    let negative = false

    while (true) {
        const byte = buffer[bufferIndex++]
        if (shift === 0 && (byte & 0x40) !== 0) negative = true

        result |= (byte & 0x3f) << shift
        shift += 7

        if ((byte & 0x80) === 0) break
    }

    return negative ? -result : result
}

function deserializeString() {
    const length = deserializeInt()
    if (length <= 0) return ''

    const start = bufferIndex
    bufferIndex += length
    return decoder.decode(buffer.subarray(start, bufferIndex))
}

function deserializeBool() {
    return buffer[bufferIndex++] ? true : false
}
