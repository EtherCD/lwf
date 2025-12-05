import assert from "assert"
import lwf from "../src"
import { inspect } from "util"

const obj = {
    array: [
        {
            map: {
                1: 20,
                3: {
                    field: 20
                }
            }
        },
        {
            map: {
                1: 20,
                2: {
                    array: [20]
                }
            }
        }
    ]
}

const a = {
    array: [
        { map: { "1": 20, "3": { field: 20 } } },
        { map: { "1": 20, "2": { array: [20] } } }
    ]
}

const schema = new lwf.Schema({
    1: {
        nested: ["array"]
    },
    array: {
        key: "array",
        isArray: true,
        fields: ["field"],
        nested: ["map"]
    },
    map: {
        key: "map",
        isMap: true,
        fields: ["field"],
        nested: ["array"]
    }
})

test("Nesting test, issue #3", () => {
    const encoded = lwf.encode(obj, schema)
    console.log(encoded)
    console.log(inspect(lwf.decode(encoded, schema), false, null, true))
    assert.deepStrictEqual(lwf.decode(encoded, schema), obj)
})
