import { Schema } from "./internal/schema"
import * as Errors from "./errors"
import { Block } from "./internal/blocks"
import { ReadContext, WriteContext } from "./internal/context"

export const lwf = {
    /**
     * Encodes object to lwf format
     * @param obj Array or Object
     * @param schema
     * @returns UInt8Array
     */
    encode(obj: Object, schema: Schema) {
        let context = new WriteContext(schema, obj)
        let element
        while ((element = context.stack.pop())) {
            Block.encode.call(context, element)
        }

        return context.buffer.slice(0, context.offset)
    },
    decode(buffer: Uint8Array, schema: Schema) {
        const context = new ReadContext(buffer, schema)

        while (context.offset < context.buffer.length) {
            Block.decode.call(context)
        }

        return context.stack.result
    },
    Schema,
    ...Errors
}

export { RawSchema, RawSchemaValue } from "./types"
export { Schema } from "./internal/schema"
export * from "./errors"
export * from "./tools"

export default lwf
