import { Block } from "./internal/blocks"
import { ReadContext } from "./internal/context"
import { Schema } from "./internal/schema"

export function deserialize(buffer: Uint8Array, schema: Schema) {
    const context = new ReadContext(buffer, schema)

    while (context.offset < context.buffer.length) {
        Block.read.call(context)
    }

    return context.stack.result
}
