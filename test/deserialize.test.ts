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
    users: {
        1: {
            name: "mirdukkkkk",
            age: "empty",
            visited: ["Empty", "Void"]
        },
        2: {
            name: "EtherCD",
            age: "abyss",
            visited: ["Abyss", "Void"]
        }
    }
}

test("Deser tests", () => {
    const schema = new Schema({
        c: {
            nested: ["a"]
        },
        a: {
            key: "users",
            fields: ["name", "age"],
            isMap: true,
            nested: ["b"]
        },
        b: {
            key: "visited",
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
    console.timeEnd("lwf serialization")

    console.time("lwf deserialization")
    const out = lwf.deserialize(buffer, schema)
    console.timeEnd("lwf deserialization")

    // Always fails here.
    // I'll fix that in future.
    deepStrictEqual(out, obj)
})
