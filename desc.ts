import { encode, Schema, decode } from "./src"
import { inspect } from "util"

let obj = [
    {
        a: {
            a: {
                cc: [20],
                b: {
                    c: true
                }
            }
        }
    },
    {
        a: {
            c: {
                cc: [20],
                b: {
                    c: true
                }
            }
        }
    }
]

const schema = new Schema({
    1: {
        isArray: true,
        nested: ["a"]
    },
    a: {
        key: "a",
        isMap: true,
        nested: ["b", "cc"]
    },
    b: {
        key: "b",
        fields: ["c"]
    },
    cc: {
        key: "cc",
        isArray: true
    }
})

console.time("MS")
const a = encode(obj, schema)
console.timeEnd("MS")
console.time("MS")
console.log(inspect(decode(a, schema), false, null, true))
console.timeEnd("MS")
