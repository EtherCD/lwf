import { deserialize } from './deserialize'
import { serialize } from './serialize'
import { Schema } from './internal/schema'

const lwf = {
    serialize,
    deserialize,
    Schema,
}

export default lwf
