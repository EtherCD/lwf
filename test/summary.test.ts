import lwf from "../src"
import assert from "assert"

const object = [
    {
        ai: {
            w: 3200,
            h: 480,
            x: 252800,
            y: 34560,
            zones: [
                { w: 2560, h: 480, x: 253120, y: 34560, type: "active" },
                { w: 64, h: 480, x: 252800, y: 34560, type: "teleport" },
                { w: 256, h: 480, x: 252864, y: 34560, type: "safe" },
                { w: 256, h: 480, x: 255680, y: 34560, type: "safe" },
                { w: 64, h: 480, x: 255936, y: 34560, type: "teleport" }
            ],
            entities: {
                "1": {
                    x: 2542630,
                    y: 348980,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "2": {
                    x: 2539120,
                    y: 348070,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                }
            },
            players: {
                "1": {
                    id: 1,
                    x: 1130,
                    y: 1160,
                    radius: 15,
                    energy: 300,
                    maxEnergy: 300,
                    color: "rgb(255, 0, 0)"
                }
            },
            area: 79,
            world: "Catastrophic Collapse"
        }
    },
    {
        // jp: {
        //     id: 1,
        //     x: 1130,
        //     y: 1160,
        //     radius: 15,
        //     energy: 300,
        //     maxEnergy: 300,
        //     color: "rgb(255, 0, 0)"
        // }
    },
    {
        // ue: {
        //     "1": { x: 2542757, y: 348817, color: "red", aura: 150 },
        //     "2": { x: 2538971, y: 347928, color: "red", aura: 150 },
        //     "3": { x: 2531768, y: 349854, color: "red", aura: 150 },
        //     "4": { x: 2544529, y: 347232, color: "red", aura: 150 }
        // }
    }
    // { p: { "1": { x: 2528150, y: 345750, firstAbLvl: 5, secondAbLvl: 5 } } }
]

const schema = new lwf.Schema({
    x: {
        isArray: true,
        nested: [
            "s",
            "p",
            "a",
            "j",
            "g",
            "q",
            "m",
            "n",
            "c",
            "d",
            "r",
            "o",
            "u"
        ]
    },
    m: {
        key: "m",
        fields: ["role", "author", "msg", "color", "world", "id"]
    },
    s: {
        key: "s",
        fields: [
            "hero",
            "name",
            "id",
            "role",
            "area",
            "world",
            "x",
            "y",
            "radius",
            "firstAbMaxLvl",
            "secondAbMaxLvl",
            "firstAbLvl",
            "secondAbLvl",
            "regen",
            "speed",
            "energy",
            "maxEnergy"
        ]
    },
    p: {
        key: "pls",
        isMap: true,
        fields: [
            "hero",
            "name",
            "id",
            "role",
            "area",
            "world",
            "died",
            "dTimer"
        ]
    },
    n: {
        key: "np",
        fields: [
            "hero",
            "name",
            "id",
            "role",
            "area",
            "world",
            "died",
            "dTimer"
        ]
    },
    j: {
        key: "jp",
        fields: ["id", "x", "y", "radius", "energy", "maxEnergy", "color"]
    },
    c: {
        key: "cp",
        isArray: true
    },
    d: {
        key: "dm"
    },
    r: {
        key: "ne",
        fields: [
            "x",
            "y",
            "radius",
            "type",
            "color",
            "stroke",
            "harmless",
            "aura",
            "energy"
        ]
    },
    g: {
        key: "ue",
        isMap: true,
        fields: [
            "x",
            "y",
            "radius",
            "type",
            "color",
            "stroke",
            "harmless",
            "aura",
            "energy"
        ]
    },
    o: {
        key: "ce",
        isArray: true
    },
    a: {
        key: "ai",
        fields: ["x", "y", "w", "h", "area", "world"],
        nested: ["z", "e", "i"]
    },
    z: {
        key: "zones",
        isArray: true,
        fields: ["type", "x", "y", "w", "h"]
    },
    e: {
        key: "entities",
        isMap: true,
        fields: [
            "x",
            "y",
            "radius",
            "type",
            "color",
            "stroke",
            "harmless",
            "aura",
            "energy"
        ]
    },
    i: {
        key: "players",
        isMap: true,
        fields: ["id", "x", "y", "radius", "energy", "maxEnergy", "color"]
    },
    u: {
        key: "up",
        fields: [
            "id",
            "radius",
            "energy",
            "speed",
            "regen",
            "firstAbLvl",
            "secondAbLvl",
            "maxEnergy",
            "world",
            "area",
            "died",
            "dTimer",
            "color"
        ]
    },
    q: {
        key: "p",
        isMap: true,
        fields: [
            "id",
            "x",
            "y",
            "radius",
            "energy",
            "speed",
            "regen",
            "firstAbLvl",
            "secondAbLvl",
            "maxEnergy",
            "world",
            "area",
            "died",
            "dTimer",
            "color"
        ]
    }
})

test("Summary test", () => {
    const encoded = lwf.encode(object, schema)
    const a = lwf.decode(encoded, schema)
    assert.deepStrictEqual(lwf.decode(encoded, schema), object)
})
