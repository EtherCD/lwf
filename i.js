const lwf = require("./dist").default
const util = require("util")
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

const enc = lwf.encode(object, schema)

console.log(util.inspect(lwf.decode(enc, schema), false, null, true))
