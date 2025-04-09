import { RawSchema } from "../src"
import { Context, ReadContext, WriteContext } from "../src/internal/context"
import { Schema } from "../src/internal/schema"

export const createReadCtx = (
    buffer: WriteContext | Uint8Array,
    schema: RawSchema
): ReadContext => {
    return new ReadContext(
        buffer instanceof WriteContext ? buffer.buffer : buffer,
        new Schema(schema)
    )
}

export const createWriteCtx = (
    schema: RawSchema,
    obj: Object
): WriteContext => {
    return new WriteContext(new Schema(schema), obj)
}

/**
 * Count operations per second for some callback
 * @param callback Callback
 * @returns Operations per second
 */
export const countOpsForCallback = (callback: () => void) => {
    let time = Date.now()
    let ops = 0
    while (Date.now() - time < 1000) {
        ops++
        callback()
    }
    return ops
}
