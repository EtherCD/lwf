import lwf, { DecodeError } from ".."
import { Block } from "../internal/blocks"
import { ReadContext } from "../internal/context"
import { Schema } from "../internal/schema"
import { RawSchema } from "../types"

const schemaVersion1 = new Schema({
    a: {
        isMap: true,
        fields: ["key", "isArray", "isMap"],
        nested: ["b", "c"]
    },
    b: {
        key: "fields",
        isArray: true
    },
    c: {
        key: "nested",
        isArray: true
    }
})

const schemaMetadata = new Schema({
    a: {
        isMap: true
    }
})

/**
 * Encodes object to simple file with header of schema
 * @param value Object
 * @param schema RawSchema (not initialized)
 * @param metadata An optional field, useful for versioning old files and maintaining them.
 * @returns Buffer
 */
const encode = (
    value: object,
    schema: RawSchema,
    metadata?: Record<string, unknown> | undefined
) => {
    const encodedSchema = lwf.encode(schema, schemaVersion1)
    const encodedValue = lwf.encode(value, new lwf.Schema(schema))
    let encodedMeta: Uint8Array | undefined
    if (metadata && Object.keys(metadata).length !== 0) {
        encodedMeta = lwf.encode(metadata, schemaMetadata)
    }
    return Buffer.from([
        0x00,
        metadata && encodedMeta !== undefined ? 0x01 : 0x00,
        ...(encodedMeta ?? []),
        ...encodedSchema,
        0xaa,
        ...encodedValue
    ])
}

/**
 * Decodes lwf file into a regular object.
 * @param value Uint8Array
 * @returns [result, metadata]
 */
const decode = (value: Buffer): [object, Record<string, unknown>] => {
    let end = -1

    for (let i = 0; i < value.length; i++)
        if (value[i] === 0xaa) {
            end = i
            break
        }

    const version = value[0]
    const hasMetadata = value[1] === 1

    let i = 2

    let metadata: Record<string, unknown> | undefined
    if (hasMetadata) {
        const context = new ReadContext(value.slice(i), schemaMetadata)
        Block.decode.call(context)
        metadata = context.stack.result as Record<string, unknown>

        i = context.offset + 2
    }

    if (end === -1) throw new DecodeError("Schema end marker 0xaa not found!")

    const schemaBytes = value.slice(i, end)
    const valueBytes = value.slice(end + 1)

    let dSchema: RawSchema

    if (version === 0)
        dSchema = lwf.decode(schemaBytes, schemaVersion1) as RawSchema
    else
        throw new Error(
            "Not supported file version " + version + ". Please update library"
        )

    const dValue = lwf.decode(valueBytes, new lwf.Schema(dSchema as any))

    return [dValue, metadata]
}

/**
 * Auxiliary utilities that allow you to store data as a file
 */
export const lwfFile = {
    encode,
    decode
}
