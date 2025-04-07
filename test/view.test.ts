import { deepStrictEqual } from "assert"
import lwf from "../src"

test("View example in bytes", () => {
    const object = {
        data: {
            name: "Catastrophic Collapse",
            colors: {
                leaderBoard: "rgba(145,152,255,255)",
                fill: "rgba(145,152,255,255)",
                stroke: "rgba(145,152,0,255)",
                chat: "rgba(145,152,255,255)"
            }
        },
        areas: [
            {
                properties: { x: 0, y: 0 },
                zones: [
                    {
                        type: "teleport",
                        x: 0,
                        y: 0,
                        w: 320,
                        h: 64,
                        translate: { x: 0, y: -11200 },
                        spawners: [
                            {
                                amount: 40,
                                radius: 0,
                                speed: "speed",
                                types: ["accelerator", "aasdasd"]
                            }
                        ]
                    },
                    {
                        type: "teleport",
                        x: 0,
                        y: 0,
                        w: 320,
                        h: 64,
                        translate: { x: 0, y: -11200 },
                        spawners: [
                            {
                                amount: 40,
                                radius: 0,
                                speed: "speed",
                                types: ["accelerator", "aasdasd"]
                            }
                        ]
                    }
                ]
            }
        ]
    }

    const data = lwf.serialize(object, schema)

    const out = lwf.deserialize(data, schema)

    deepStrictEqual(out, object)

    // let string = ''
    // for (const e of data) {
    //     let r = decToHex(e)
    //     string += `0x${r.length === 1 ? '0' : ''}${r} `
    // }
    // console.log(string)
})

const schema = new lwf.Schema({
    g: {
        nested: ["d", "a"]
    },
    d: {
        key: "data",
        fields: ["name"],
        nested: ["c"]
    },
    c: {
        key: "colors",
        fields: ["leaderBoard", "fill", "stroke", "chat"]
    },
    a: {
        key: "areas",
        isArray: true,
        nested: ["p", "z"]
    },
    p: {
        key: "properties",
        fields: ["x", "y", "w", "h"]
    },
    z: {
        key: "zones",
        isArray: true,
        fields: ["type", "x", "y", "w", "h"],
        nested: ["s", "l"]
    },
    l: {
        key: "translate",
        fields: ["x", "y"]
    },
    s: {
        key: "spawners",
        isArray: true,
        fields: ["speed", "radius", "amount"],
        nested: ["t"]
    },
    t: {
        key: "types",
        isArray: true
    }
})

var hexchar = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"].map(
    (v) => v.toString()
)
function decToHex(num) {
    let out = num & 15
    num = num >>> 4
    return num ? decToHex(num) + hexchar[out] : hexchar[out]
}
