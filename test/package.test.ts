import { deepStrictEqual, strictEqual } from "assert"
import lwf from "../src"

test("Test encoding large first package from game server", () => {
    const binaryData = lwf.encode(object, schema)
    const jsonData = JSON.stringify(object)

    console.log("Size in json: " + Math.round(jsonData.length / 10.24) / 100)
    console.log("Size in lwfb: " + Math.round(binaryData.length / 10.24) / 100)

    const out = lwf.decode(binaryData, schema)

    deepStrictEqual(out, object)
})

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

const object = [
    {
        s: {
            hero: "Magmax",
            name: "HERO",
            id: 1,
            role: 1,
            area: 79,
            world: "Catastrophic Collapse",
            x: 1130,
            y: 1160,
            radius: 15,
            firstAbMaxLvl: 5,
            secondAbMaxLvl: 5,
            firstAbLvl: 5,
            secondAbLvl: 5,
            regen: 7,
            speed: 16,
            energy: 300,
            maxEnergy: 300
        }
    },
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
                },
                "3": {
                    x: 2531580,
                    y: 349770,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "4": {
                    x: 2544470,
                    y: 347430,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "5": {
                    x: 2549760,
                    y: 348810,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "6": {
                    x: 2554960,
                    y: 348180,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "7": {
                    x: 2536520,
                    y: 346110,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "8": {
                    x: 2538330,
                    y: 350070,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "9": {
                    x: 2552530,
                    y: 346270,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "10": {
                    x: 2554550,
                    y: 348890,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "11": {
                    x: 2543480,
                    y: 349500,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "12": {
                    x: 2553040,
                    y: 346940,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "13": {
                    x: 2531610,
                    y: 346430,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "14": {
                    x: 2535740,
                    y: 345830,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "15": {
                    x: 2550100,
                    y: 349640,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "16": {
                    x: 2554400,
                    y: 346400,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "17": {
                    x: 2546910,
                    y: 348160,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "18": {
                    x: 2551360,
                    y: 348970,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "19": {
                    x: 2531790,
                    y: 349290,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "20": {
                    x: 2553620,
                    y: 348080,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "21": {
                    x: 2537750,
                    y: 346380,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "22": {
                    x: 2533020,
                    y: 349430,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "23": {
                    x: 2547320,
                    y: 346320,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "24": {
                    x: 2552940,
                    y: 349320,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "25": {
                    x: 2540590,
                    y: 349780,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "26": {
                    x: 2544910,
                    y: 348540,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "27": {
                    x: 2536990,
                    y: 349970,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "28": {
                    x: 2539390,
                    y: 347170,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "29": {
                    x: 2548050,
                    y: 349030,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "30": {
                    x: 2549280,
                    y: 346480,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "31": {
                    x: 2551030,
                    y: 347080,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "32": {
                    x: 2555490,
                    y: 346470,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "33": {
                    x: 2551170,
                    y: 348020,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "34": {
                    x: 2552370,
                    y: 349510,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "35": {
                    x: 2547910,
                    y: 349400,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "36": {
                    x: 2541710,
                    y: 348330,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "37": {
                    x: 2538530,
                    y: 347700,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "38": {
                    x: 2543200,
                    y: 346330,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "39": {
                    x: 2536940,
                    y: 348010,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "40": {
                    x: 2545930,
                    y: 348320,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "41": {
                    x: 2552250,
                    y: 347160,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "42": {
                    x: 2540120,
                    y: 348970,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "43": {
                    x: 2552750,
                    y: 349480,
                    radius: 22.5,
                    type: "slower",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 150
                },
                "44": {
                    x: 2549520,
                    y: 347950,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "45": {
                    x: 2539150,
                    y: 348180,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "46": {
                    x: 2537490,
                    y: 346660,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "47": {
                    x: 2539700,
                    y: 348230,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "48": {
                    x: 2541320,
                    y: 350010,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "49": {
                    x: 2539140,
                    y: 348010,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "50": {
                    x: 2546190,
                    y: 347960,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "51": {
                    x: 2539210,
                    y: 349300,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "52": {
                    x: 2537700,
                    y: 347300,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "53": {
                    x: 2555830,
                    y: 346320,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "54": {
                    x: 2536450,
                    y: 349120,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "55": {
                    x: 2534320,
                    y: 346570,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "56": {
                    x: 2543760,
                    y: 348320,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "57": {
                    x: 2548720,
                    y: 347450,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "58": {
                    x: 2556000,
                    y: 349100,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "59": {
                    x: 2546530,
                    y: 348650,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "60": {
                    x: 2547630,
                    y: 349670,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "61": {
                    x: 2540300,
                    y: 349520,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "62": {
                    x: 2540380,
                    y: 349880,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "63": {
                    x: 2552180,
                    y: 346310,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "64": {
                    x: 2533310,
                    y: 346980,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "65": {
                    x: 2534970,
                    y: 349810,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "66": {
                    x: 2534030,
                    y: 346630,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "67": {
                    x: 2550910,
                    y: 347000,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "68": {
                    x: 2542170,
                    y: 347670,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "69": {
                    x: 2544020,
                    y: 347880,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "70": {
                    x: 2544530,
                    y: 349750,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "71": {
                    x: 2538990,
                    y: 348550,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "72": {
                    x: 2554970,
                    y: 349200,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "73": {
                    x: 2548680,
                    y: 349810,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "74": {
                    x: 2536080,
                    y: 346430,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "75": {
                    x: 2549810,
                    y: 347810,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "76": {
                    x: 2555700,
                    y: 347610,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "77": {
                    x: 2537850,
                    y: 349320,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "78": {
                    x: 2553020,
                    y: 348500,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "79": {
                    x: 2544010,
                    y: 346940,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "80": {
                    x: 2534340,
                    y: 348890,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "81": {
                    x: 2535240,
                    y: 349790,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "82": {
                    x: 2554910,
                    y: 349840,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "83": {
                    x: 2553420,
                    y: 347330,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "84": {
                    x: 2548190,
                    y: 349720,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "85": {
                    x: 2548200,
                    y: 349570,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "86": {
                    x: 2552670,
                    y: 349180,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "87": {
                    x: 2537100,
                    y: 349350,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "88": {
                    x: 2551760,
                    y: 349330,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "89": {
                    x: 2542890,
                    y: 349270,
                    radius: 33.75,
                    type: "normal",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "90": {
                    x: 2550168,
                    y: 346038,
                    radius: 43.75,
                    type: "wall",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "91": {
                    x: 2555898,
                    y: 346038,
                    radius: 43.75,
                    type: "wall",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "92": {
                    x: 2555023,
                    y: 349963,
                    radius: 43.75,
                    type: "wall",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "93": {
                    x: 2549293,
                    y: 349963,
                    radius: 43.75,
                    type: "wall",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "94": {
                    x: 2543563,
                    y: 349963,
                    radius: 43.75,
                    type: "wall",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "95": {
                    x: 2537833,
                    y: 349963,
                    radius: 43.75,
                    type: "wall",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "96": {
                    x: 2532103,
                    y: 349963,
                    radius: 43.75,
                    type: "wall",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "97": {
                    x: 2532978,
                    y: 346038,
                    radius: 43.75,
                    type: "wall",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "98": {
                    x: 2538708,
                    y: 346038,
                    radius: 43.75,
                    type: "wall",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "99": {
                    x: 2544438,
                    y: 346038,
                    radius: 43.75,
                    type: "wall",
                    color: "#43c59b",
                    stroke: true,
                    harmless: false,
                    aura: 0
                },
                "100": {
                    x: 2547160,
                    y: 346180,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "101": {
                    x: 2536200,
                    y: 347310,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "102": {
                    x: 2535930,
                    y: 348530,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "103": {
                    x: 2534760,
                    y: 348440,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "104": {
                    x: 2537290,
                    y: 350260,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "105": {
                    x: 2553180,
                    y: 345810,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "106": {
                    x: 2547520,
                    y: 347750,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "107": {
                    x: 2543270,
                    y: 348710,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "108": {
                    x: 2545260,
                    y: 348940,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "109": {
                    x: 2534610,
                    y: 349650,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "110": {
                    x: 2541430,
                    y: 345880,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "111": {
                    x: 2550480,
                    y: 350040,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "112": {
                    x: 2556670,
                    y: 348280,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "113": {
                    x: 2542750,
                    y: 347900,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "114": {
                    x: 2539300,
                    y: 345820,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "115": {
                    x: 2540790,
                    y: 346560,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "116": {
                    x: 2532900,
                    y: 347190,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "117": {
                    x: 2536490,
                    y: 349040,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "118": {
                    x: 2555660,
                    y: 348360,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "119": {
                    x: 2556220,
                    y: 348180,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "120": {
                    x: 2542600,
                    y: 345820,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "121": {
                    x: 2538170,
                    y: 347550,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "122": {
                    x: 2531700,
                    y: 346470,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "123": {
                    x: 2543590,
                    y: 345930,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
                },
                "124": {
                    x: 2542140,
                    y: 348300,
                    radius: 9,
                    type: "",
                    color: "#43c59b",
                    stroke: false,
                    harmless: false,
                    aura: 0
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
        jp: {
            id: 1,
            x: 1130,
            y: 1160,
            radius: 15,
            energy: 300,
            maxEnergy: 300,
            color: "rgb(255, 0, 0)"
        }
    },
    {
        ue: {
            "1": { x: 2542757, y: 348817, color: "red", aura: 150 },
            "2": { x: 2538971, y: 347928, color: "red", aura: 150 },
            "3": { x: 2531768, y: 349854, color: "red", aura: 150 },
            "4": { x: 2544529, y: 347232, color: "red", aura: 150 },
            "5": { x: 2549846, y: 348997, color: "red", aura: 150 },
            "6": { x: 2555139, y: 348078, color: "red", aura: 150 },
            "7": { x: 2536397, y: 346276, color: "red", aura: 150 },
            "8": { x: 2538527, y: 350010, color: "red", aura: 150 },
            "9": { x: 2552717, y: 346183, color: "red", aura: 150 },
            "10": { x: 2554704, y: 348752, color: "red", aura: 150 },
            "11": { x: 2543606, y: 349337, color: "red", aura: 150 },
            "12": { x: 2553181, y: 346790, color: "red", aura: 150 },
            "13": { x: 2531625, y: 346224, color: "red", aura: 150 },
            "14": { x: 2535878, y: 345676, color: "red", aura: 150 },
            "15": { x: 2550294, y: 349571, color: "red", aura: 150 },
            "16": { x: 2554590, y: 346320, color: "red", aura: 150 },
            "17": { x: 2547082, y: 348047, color: "red", aura: 150 },
            "18": { x: 2551384, y: 348765, color: "red", aura: 150 },
            "19": { x: 2531703, y: 349477, color: "red", aura: 150 },
            "20": { x: 2553773, y: 347942, color: "red", aura: 150 },
            "21": { x: 2537553, y: 346441, color: "red", aura: 150 },
            "22": { x: 2533082, y: 349627, color: "red", aura: 150 },
            "23": { x: 2547525, y: 346345, color: "red", aura: 150 },
            "24": { x: 2553019, y: 349510, color: "red", aura: 150 },
            "25": { x: 2540473, y: 349950, color: "red", aura: 150 },
            "26": { x: 2545100, y: 348620, color: "red", aura: 150 },
            "27": { x: 2537196, y: 349961, color: "red", aura: 150 },
            "28": { x: 2539203, y: 347256, color: "red", aura: 150 },
            "29": { x: 2548253, y: 349067, color: "red", aura: 150 },
            "30": { x: 2549119, y: 346609, color: "red", aura: 150 },
            "31": { x: 2550934, y: 346897, color: "red", aura: 150 },
            "32": { x: 2555637, y: 346325, color: "red", aura: 150 },
            "33": { x: 2551131, y: 348223, color: "red", aura: 150 },
            "34": { x: 2552490, y: 349342, color: "red", aura: 150 },
            "35": { x: 2548063, y: 349262, color: "red", aura: 150 },
            "36": { x: 2541533, y: 348224, color: "red", aura: 150 },
            "37": { x: 2538461, y: 347506, color: "red", aura: 150 },
            "38": { x: 2543072, y: 346492, color: "red", aura: 150 },
            "39": { x: 2536875, y: 347814, color: "red", aura: 150 },
            "40": { x: 2545993, y: 348123, color: "red", aura: 150 },
            "41": { x: 2552202, y: 347361, color: "red", aura: 150 },
            "42": { x: 2540195, y: 348778, color: "red", aura: 150 },
            "43": { x: 2552910, y: 349349, color: "red", aura: 150 },
            "44": { x: 2549724, y: 347980, color: "#787878" },
            "45": { x: 2539122, y: 347976, color: "#787878" },
            "46": { x: 2537488, y: 346454, color: "#787878" },
            "47": { x: 2539843, y: 348081, color: "#787878" },
            "48": { x: 2541208, y: 349837, color: "#787878" },
            "49": { x: 2539175, y: 347807, color: "#787878" },
            "50": { x: 2546289, y: 348141, color: "#787878" },
            "51": { x: 2539373, y: 349173, color: "#787878" },
            "52": { x: 2537509, y: 347222, color: "#787878" },
            "53": { x: 2555632, y: 346261, color: "#787878" },
            "54": { x: 2536639, y: 349203, color: "#787878" },
            "55": { x: 2534124, y: 346635, color: "#787878" },
            "56": { x: 2543966, y: 348328, color: "#787878" },
            "57": { x: 2548685, y: 347653, color: "#787878" },
            "58": { x: 2555884, y: 348929, color: "#787878" },
            "59": { x: 2546477, y: 348849, color: "#787878" },
            "60": { x: 2547452, y: 349774, color: "#787878" },
            "61": { x: 2540279, y: 349315, color: "#787878" },
            "62": { x: 2540479, y: 349699, color: "#787878" },
            "63": { x: 2552365, y: 346218, color: "#787878" },
            "64": { x: 2533120, y: 347060, color: "#787878" },
            "65": { x: 2534764, y: 349813, color: "#787878" },
            "66": { x: 2533922, y: 346454, color: "#787878" },
            "67": { x: 2551115, y: 346981, color: "#787878" },
            "68": { x: 2542082, y: 347856, color: "#787878" },
            "69": { x: 2543838, y: 347976, color: "#787878" },
            "70": { x: 2544367, y: 349623, color: "#787878" },
            "71": { x: 2538983, y: 348344, color: "#787878" },
            "72": { x: 2554764, y: 349204, color: "#787878" },
            "73": { x: 2548882, y: 349767, color: "#787878" },
            "74": { x: 2536082, y: 346224, color: "#787878" },
            "75": { x: 2549928, y: 347979, color: "#787878" },
            "76": { x: 2555502, y: 347551, color: "#787878" },
            "77": { x: 2537879, y: 349524, color: "#787878" },
            "78": { x: 2552832, y: 348585, color: "#787878" },
            "79": { x: 2544207, y: 347003, color: "#787878" },
            "80": { x: 2534188, y: 349029, color: "#787878" },
            "81": { x: 2535188, y: 349591, color: "#787878" },
            "82": { x: 2554743, y: 349719, color: "#787878" },
            "83": { x: 2553532, y: 347157, color: "#787878" },
            "84": { x: 2548289, y: 349539, color: "#787878" },
            "85": { x: 2548025, y: 349679, color: "#787878" },
            "86": { x: 2552822, y: 349319, color: "#787878" },
            "87": { x: 2537292, y: 349275, color: "#787878" },
            "88": { x: 2551742, y: 349535, color: "#787878" },
            "89": { x: 2543092, y: 349311, color: "#787878" },
            "90": { x: 2550013, y: 346038, color: "#333" },
            "91": { x: 2555743, y: 346038, color: "#333" },
            "92": { x: 2555177, y: 349963, color: "#333" },
            "93": { x: 2549447, y: 349963, color: "#333" },
            "94": { x: 2543717, y: 349963, color: "#333" },
            "95": { x: 2537987, y: 349963, color: "#333" },
            "96": { x: 2532257, y: 349963, color: "#333" },
            "97": { x: 2532823, y: 346038, color: "#333" },
            "98": { x: 2538553, y: 346038, color: "#333" },
            "99": { x: 2544283, y: 346038, color: "#333" },
            "100": { x: 2547160, y: 346180, color: "#f98f6b" },
            "101": { x: 2536200, y: 347310, color: "#3b96fd" },
            "102": { x: 2535930, y: 348530, color: "#43c59b" },
            "103": { x: 2534760, y: 348440, color: "#43c59b" },
            "104": { x: 2537290, y: 350260, color: "#3b96fd" },
            "105": { x: 2553180, y: 345810, color: "#b84dd4" },
            "106": { x: 2547520, y: 347750, color: "#43c59b" },
            "107": { x: 2543270, y: 348710, color: "#3b96fd" },
            "108": { x: 2545260, y: 348940, color: "#f98f6b" },
            "109": { x: 2534610, y: 349650, color: "#a32dd8" },
            "110": { x: 2541430, y: 345880, color: "#b84dd4" },
            "111": { x: 2550480, y: 350040, color: "#3b96fd" },
            "112": { x: 2556670, y: 348280, color: "#b84dd4" },
            "113": { x: 2542750, y: 347900, color: "#f98f6b" },
            "114": { x: 2539300, y: 345820, color: "#a32dd8" },
            "115": { x: 2540790, y: 346560, color: "#a32dd8" },
            "116": { x: 2532900, y: 347190, color: "#43c59b" },
            "117": { x: 2536490, y: 349040, color: "#a32dd8" },
            "118": { x: 2555660, y: 348360, color: "#b84dd4" },
            "119": { x: 2556220, y: 348180, color: "#f98f6b" },
            "120": { x: 2542600, y: 345820, color: "#3b96fd" },
            "121": { x: 2538170, y: 347550, color: "#3b96fd" },
            "122": { x: 2531700, y: 346470, color: "#3b96fd" },
            "123": { x: 2543590, y: 345930, color: "#43c59b" },
            "124": { x: 2542140, y: 348300, color: "#43c59b" }
        }
    },
    { p: { "1": { x: 2528150, y: 345750, firstAbLvl: 5, secondAbLvl: 5 } } }
]
