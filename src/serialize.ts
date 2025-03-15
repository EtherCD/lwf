import { SchemaError, SerializationError } from './errors'
import { Options, RawSchema, Schema, SingleSchema, TypeByte } from './types'
import { processOptions, processSchema } from './util'

var objectIndex = 0
var schemaIndex = 0
var schemas: SingleSchema[] = []
var objects: [Object, number?][]

var buffer = new Uint8Array(1)
var bufferIndex = 0

const typeHandlers = {
    number: serializeInt,
    string: serializeString,
    boolean: serializeBool,
}

const typesToTypes = {
    int: 'number',
    nint: 'number',
    bool: 'boolean',
    char: 'string',
    str: 'string',
}

export function serialize(obj: Object, schema: RawSchema, options?: Options) {
    options = processOptions(options)
    schemas = processSchema(schema)

    objects = [[obj]]

    while (objectIndex < objects.length) {
        serializeObject()
        objectIndex++
    }

    const returnBuffer = buffer.slice(0, bufferIndex)
    free()
    return returnBuffer
}

function serializeObject() {
    const [object, index = schemaIndex] = objects[objectIndex]
    let iSchema = schemas[index] || { args: [] }
    const sExists = schemas.length > index

    if (!sExists) throw new SchemaError(`Schema for ${object} is not described`)

    serializeInt(index, false)

    if (Array.isArray(object)) {
        for (const element of object) {
            if (typeof element === 'object' && element !== null) {
                objects.push([element, index])
            } else {
                serializeValue(element)
            }
        }
        return
    }

    const keys = Object.keys(object)
    const types = iSchema.types
    let eIndex = 0

    for (const key of keys) {
        const value = object[key]
        const schemaIndex = iSchema.args?.indexOf(key) ?? -1

        if (schemaIndex === -1) {
            if (typeof value === 'object' && value !== null) {
                let nestedSchemaIndex
                if (!iSchema.isKeyedObject) {
                    nestedSchemaIndex = schemas.findIndex((s) => s.key === key)
                    if (nestedSchemaIndex === -1) {
                        throw new SchemaError(
                            `No schema defined for nested object key: ${key}`
                        )
                    }
                }
                objects.push([
                    value,
                    iSchema.isKeyedObject ? index : nestedSchemaIndex,
                ])
            } else {
                throw new SerializationError(
                    `Unexpected key: ${key} ${iSchema.args}`
                )
            }
        }

        const shift = schemaIndex - eIndex
        if (shift === 1) {
            ensureCapacity(1)
            buffer[bufferIndex++] = TypeByte.Empty
        } else if (shift > 1) {
            ensureCapacity(2)
            buffer[bufferIndex++] = TypeByte.EmptyDepth
            buffer[bufferIndex++] = shift & 0xff
        }
        eIndex++

        //         buffer[bufferIndex++] = TypeByte.Null

        if (typeof value !== 'object') {
            serializeValue(value, types ? types[schemaIndex] : undefined)
        }
    }
}

function serializeValue(input: unknown, type?: string) {
    if (type && type !== 'any' && typesToTypes[type] !== typeof input)
        throw new Error(
            `Type of value is not assignable to schema ${input} ${type} ${
                typesToTypes[type]
            } ${typeof input}`
        )
    const handler = typeHandlers[typeof input as keyof typeof typeHandlers]
    if (handler) handler(input as never, type === undefined)
    else throw new Error("LWFB can't process bigint, symbol, function")
}

function serializeInt(input: number, writeType: boolean) {
    ensureCapacity(10)
    const isNegative = input < 0
    if (isNegative) input = -input

    if (writeType)
        buffer[bufferIndex++] = isNegative ? TypeByte.nInt : TypeByte.Int
    do {
        let byte = input & 0x7f
        input >>= 7
        if (input > 0) byte |= 0x80
        buffer[bufferIndex++] = byte
    } while (input > 0)

    if (isNegative) buffer[bufferIndex - 1] |= 0x40
}

function serializeString(value: string, writeType: boolean) {
    if (value.length === 0) {
        ensureCapacity(1)
        if (writeType) buffer[bufferIndex++] = TypeByte.String
        buffer[bufferIndex++] = 0x00
        return
    }
    if (value.length === 1) {
        ensureCapacity(2)
        if (writeType) buffer[bufferIndex++] = TypeByte.Char
        buffer[bufferIndex++] = value.charCodeAt(0)
        return
    }

    if (writeType) buffer[bufferIndex++] = TypeByte.String

    serializeInt(value.length, false)
    ensureCapacity(value.length)

    for (let i = 0; i < value.length; i++)
        buffer[bufferIndex++] = value.charCodeAt(i)
}

function serializeBool(input: boolean) {
    ensureCapacity(1)
    buffer[buffer.length - 1] |= input ? 0x01 : 0x01
}

function ensureCapacity(size) {
    if (bufferIndex + size > buffer.length) {
        let newBuffer = new Uint8Array(buffer.length * 2 + size)
        newBuffer.set(buffer)
        buffer = newBuffer
    }
}

function free() {
    objectIndex = 0
    schemaIndex = 0
    schemas = []
    objects = []

    buffer = new Uint8Array(1024)
    bufferIndex = 0
}
