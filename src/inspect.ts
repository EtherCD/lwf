import { Block } from "./internal/blocks"
import { ReadContext } from "./internal/context"
import { Schema } from "./internal/schema"
import { Empty, Value } from "./internal/vars"
import { TypeByte } from "./types"

export const inspect = (
    buffer: Uint8Array | Buffer | ArrayBuffer,
    schema: Schema
): Object => {
    const context = new ReadContext(buffer, schema)
    let elements = []

    while (context.offset < context.buffer.length) {
        let schema = context.schema.getSchema(Value.decode.call(context))
        let fields = 0
        while (fields < schema.fields.length) {
            let type = context.buffer[context.offset]
            let typeDesc = ""
            if (Empty.check.call(context)) {
                const offset = Empty.decode.call(context)
                fields += offset
                for (let i = 0; i < offset; i++) {
                    elements.push("Empty", offset)
                }
            } else {
                if (type >= 0x10 && type <= 0x87) {
                    typeDesc = "Uint"
                } else if (type > 0x87 && type <= 0xff) {
                    typeDesc = "String"
                } else {
                    typeDesc = TypeByte[type]
                }

                const value = Value.decode.call(context)

                elements.push(typeDesc, value)

                fields += 1
            }
        }
    }

    return elements
}
