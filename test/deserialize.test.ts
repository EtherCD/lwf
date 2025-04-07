import { deepStrictEqual } from "assert"
import lwf from "../src"
import { Schema } from "../src/internal/schema"
import fs from "fs"
import util from "util"
import { ReadStack } from "../src/internal/stack"

const pixels: { x: number; y: number; color: string }[] = []
for (let x = 0; x < 2; x++)
    for (let y = 0; y < 2; y++) pixels.push({ x, y, color: "#000000" })

const obj = {
    users: ["118.123342", "118.123342", "118.123342"]
}

test("Deser tests", () => {
    const schema = new Schema({
        c: {
            nested: ["a"]
        },
        a: {
            key: "users",
            isArray: true
        }
    })

    console.time("json stringify")
    const text = JSON.stringify(obj)
    console.timeEnd("json stringify")
    console.time("json parse")
    JSON.parse(text)
    console.timeEnd("json parse")

    console.time("lwf serialization")
    const buffer = lwf.serialize(obj, schema)
    console.log(buffer)
    console.timeEnd("lwf serialization")

    let string = ""
    for (const e of buffer) {
        let r = decToHex(e)
        string += `0x${r.length === 1 ? "0" : ""}${r} `
    }
    console.log(string)

    console.time("lwf deserialization")
    const out = lwf.deserialize(buffer, schema)
    console.timeEnd("lwf deserialization")

    console.log(out)

    // Always fails here.
    // I'll fix that in future.
    deepStrictEqual(out, obj)
})

var hexchar = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"].map(
    (v) => v.toString()
)
function decToHex(num) {
    let out = num & 15
    num = num >>> 4
    return num ? decToHex(num) + hexchar[out] : hexchar[out]
}
