import { encode, Schema, decode } from "./src"
import { convert } from "./src/compability"
import fs from "fs"
import { load } from "yaml-js"
import { inspect } from "util"

const obj = load(fs.readFileSync("Catastrophic Collapse.yaml"))

const schema = new Schema({
    1: {
        nested: ["data", "areas"]
    },
    data: {
        key: "data",
        fields: ["name"],
        nested: ["colors"]
    },

    colors: {
        key: "colors",
        fields: ["leaderBoard", "chat", "fill", "stroke"]
    },
    areas: {
        key: "areas",
        isArray: true,
        nested: ["properties", "zones"]
    },
    properties: {
        key: "properties",
        fields: ["x", "y"]
    },
    zones: {
        key: "zones",
        isArray: true,
        fields: ["type", "x", "y", "w", "h"],
        nested: ["translate", "spawners"]
    },
    translate: {
        key: "translate",
        fields: ["x", "y"]
    },
    spawners: {
        key: "spawners",
        fields: ["amount", "radius", "speed"],
        isArray: true,
        nested: ["types"]
    },
    types: {
        key: "types",
        isArray: true
    }
})

const newSchema = new Schema({
    1: {
        nested: ["data", "areas"]
    },
    data: {
        key: "data",
        fields: ["name", "class"],
        nested: ["colors"]
    },
    colors: {
        key: "colors",
        fields: ["leaderBoard", "chat", "fill", "stroke"]
    },
    areas: {
        key: "areas",
        isArray: true,
        nested: ["properties", "zones"]
    },
    properties: {
        key: "properties",
        fields: ["x", "y"]
    },
    zones: {
        key: "zones",
        isArray: true,
        fields: ["type", "x", "y", "w", "h"],
        nested: ["translate"]
    },
    translate: {
        key: "translate",
        fields: ["x", "y"]
    }
    // spawners: {
    //     key: "spawners",
    //     fields: ["amount", "radius", "speed", "velocity"],
    //     isArray: true,
    //     nested: ["types"]
    // },
    // types: {
    //     key: "types",
    //     isArray: true
    // }
})

const a = encode(obj, schema)

console.log(inspect(a, false, null, true))

const b = convert(a, schema, newSchema)

console.log(b)
console.log(inspect(decode(b, newSchema), false, null, true))

// fs.writeFileSync("Catastrophic Collapse.lwf", a)
