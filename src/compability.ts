import { Block } from "./internal/blocks"
import { ConvertContext, WriteContext } from "./internal/context"
import { Schema } from "./internal/schema"

export const convert = (
    buffer: Uint8Array,
    oldSchema: Schema,
    newSchema: Schema
) => {
    const decode = new ConvertContext(buffer, oldSchema)
    const encode = new WriteContext(newSchema, {})

    while (decode.offset < decode.buffer.length) {
        Block.convert.call(null, decode, encode)
    }

    return encode.buffer.slice(0, encode.offset)
}
