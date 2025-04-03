import { Block } from './internal/blocks'
import { WriteContext } from './internal/context'
import { Schema } from './internal/schema'

export function serialize(obj: Object, schema: Schema) {
    let context = new WriteContext(schema, obj)
    let element
    while ((element = context.stack.pop())) {
        Block.write.call(context, element)
    }

    return context.buffer.slice(0, context.offset)
}
