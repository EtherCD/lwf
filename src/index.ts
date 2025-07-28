import { Schema } from "./internal/schema"
import * as Errors from "./errors"
import { Block } from "./internal/blocks"
import { ReadContext, WriteContext } from "./internal/context"

/**
 * Decodes buffer to Object
 * @param obj Array or Object
 * @param schema
 * @returns UInt8Array
 */
export const decode = (
    buffer: Uint8Array | Buffer | ArrayBuffer,
    schema: Schema
): Object => {
    const context = new ReadContext(buffer, schema)

    while (context.offset < context.buffer.length) {
        Block.decode.call(context)
    }

    context.stack.collapse()

    return context.stack.result
}

/**
 * Encodes object to lwf format
 * @param obj Array or Object
 * @param schema
 * @returns UInt8Array
 */
export const encode = (object: Object, schema: Schema): Uint8Array => {
    let context = new WriteContext(schema, object)
    let element
    while ((element = context.stack.pop())) {
        Block.encode.call(context, element)
    }

    return context.buffer.slice(0, context.offset)
}

const lwf = {
    encode,
    decode,
    Schema,
    ...Errors
}

export { RawSchema, RawSchemaValue } from "./types"

export { Schema }

export * from "./errors"

export default lwf
