import ieee754 from 'ieee754'
import { SchemaError, SerializationError } from './errors'
import { RawSchema, Schema, SingleSchema, TypeByte, VarsContext } from './types'
import { processOptions, processSchema } from './util'
import { UVarInt32, Value } from './vars'

var objectIndex = 0
var schemaIndex = 0
var schemas: SingleSchema[] = []
var objects: [Object, number?][]

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

const typesToTypes = {
    int: 'number',
    nint: 'number',
    bool: 'boolean',
    char: 'string',
    str: 'string',
}

export function serialize(obj: Object, schema: RawSchema) {
    // options = processOptions(options)
    schemas = processSchema(schema)
    objects = [[obj]]

    while (objectIndex < objects.length) {
        serializeObject.call(context)
        objectIndex++
    }

    const returnBuffer = context.buffer.slice(0, context.offset)
    free()
    return returnBuffer
}

function serializeObject(this: VarsContext) {
    const [object, index = schemaIndex] = objects[objectIndex]
    let iSchema = schemas[index] || { args: [] }
    const sExists = schemas.length > index

    if (!sExists) throw new SchemaError(`Schema for ${object} is not described`)

    UVarInt32.write.call(this, index)

    if (Array.isArray(object)) {
        for (const element of object) {
            if (typeof element === 'object' && element !== null) {
                objects.push([element, index])
            } else {
                Value.write.call(this, element)
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
            this.ensure(1)
            this.buffer[this.offset++] = TypeByte.Empty
        } else if (shift > 1) {
            this.ensure(2)
            this.buffer[this.offset++] = TypeByte.EmptyCount
            this.buffer[this.offset++] = shift & 0xff
        }
        eIndex++

        //         buffer[context.offset++] = TypeByte.Null

        if (typeof value !== 'object') {
            Value.write.call(this, value)
        }
    }
}

function free() {
    objectIndex = 0
    schemaIndex = 0
    schemas = []
    objects = []

    context.buffer = new Uint8Array(1024)
    context.offset = 0
}
