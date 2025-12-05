import { deepStrictEqual } from "assert"
import lwf from "../src"
import { Schema } from "../src/internal/schema"
import fs from "fs"
import util from "util"
import { ReadStack } from "../src/internal/stack"

const pixels: { x: number; y: number; color: string }[] = []
for (let x = 0; x < 2; x++)
    for (let y = 0; y < 2; y++) pixels.push({ x, y, color: "#000000" })

test("Deser tests", () => {
    const schema = new Schema({
        a: {
            isArray: true,
            fields: ["message", "length", "verified", "name", "grammarCheck"]
        }
    })

    const object = [
        {
            message: "Hello World!!!",
            length: 1000,
            verified: true,
            grammarCheck: false
        },
        {
            message: "Hello World!!!",
            length: 1000,
            verified: true,
            grammarCheck: false
        }
    ]

    // Returns UInt8Array
    const buffer = lwf.encode(object, schema)
    // Returns object or array
    const array = lwf.decode(buffer, schema)
    console.log(buffer.length, JSON.stringify(object).length)

    deepStrictEqual(array, object)

    // let string = ""
    // for (const e of buffer) {
    //     let r = decToHex(e)
    //     string += `0x${r.length === 1 ? "0" : ""}${r} `
    // }
    // console.log(string)

    // console.log(out)

    // // Always fails here.
    // // I'll fix that in future.
    // deepStrictEqual(out, obj)
})
