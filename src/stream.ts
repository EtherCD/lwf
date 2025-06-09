import { Block } from "./internal/blocks"
import { ReadContext } from "./internal/context"
import { Schema } from "./internal/schema"

export const decode = (
    context: ReadContext,
    block: Uint8Array | Buffer | ArrayBuffer,
    schema: Schema
): Object => {
    Block.decode.call(context)

    return context.stack.result
}
