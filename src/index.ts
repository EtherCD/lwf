import { deserialize } from "./deserialize"
import { serialize } from "./serialize"
import { Schema } from "./internal/schema"
import * as Errors from "./errors"

const lwf = {
    serialize,
    deserialize,
    Schema,
    Errors
}

export { RawSchema, RawSchemaValue } from "./types"

export default { ...lwf }
