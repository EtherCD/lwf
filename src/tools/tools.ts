import { ReadContext } from "../internal/context"
import { Schema } from "../internal/schema"
import { Empty, EndOfBlock, Value } from "../internal/vars"

/**
 * A tool that allows you to look inside a file and output the result to the console.
 * @param array Uint8Array
 * @returns Colored string
 */
const inspect = (array: Uint8Array) => {
    const context = new ReadContext(
        array,
        new Schema({
            a: {}
        })
    )

    let output = ""

    while (context.offset < context.buffer.length) {
        try {
            const v = Value.decode.call(context)
            switch (typeof v) {
                case "bigint":
                case "number":
                    output += "\x1b[32m"
                    break
                case "boolean":
                    output += "\x1b[33m"
                    break
                case "string":
                    output += "\x1b[34m"
                    break
            }
            output += v + "\x1b[0m "
            continue
        } catch {}

        if (Empty.check.call(context)) {
            output += "\x1b[33m" + Empty.decode.call(context) + "\x1b[0m "
            continue
        }
        if (EndOfBlock.check.call(context)) {
            output += "\x1b[90m" + EndOfBlock.decode.call(context) + "\x1b[0m "
            continue
        }

        if (context.peek() === 0xaa) {
            output += "\x1b[90m EOB\x1b[0m "
            continue
        }

        context.read()
    }

    return output
}

export const lwfTools = { inspect }
