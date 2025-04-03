import lwf from '../src'
import fs from 'fs'
import { Schema } from '../src/internal/schema'

test('View example in bytes', () => {
    // const object = JSON.parse(fs.readFileSync('world.json') + '')
    const object = {
        data: {
            name: 'Catastrophic Collapse',
            colors: {
                leaderBoard: 'rgba(145,152,255,255)',
                fill: 'rgba(145,152,255,255)',
                stroke: 'rgba(145,152,0,255)',
                chat: 'rgba(145,152,255,255)',
            },
        },
        areas: [
            {
                properties: { x: 0, y: 0 },
                zones: [
                    {
                        type: 'teleport',
                        x: 0,
                        y: 0,
                        w: 320,
                        h: 64,
                        translate: { x: 0, y: -11200 },
                        spawners: [
                            {
                                amount: 40,
                                radius: 0,
                                speed: 'speed',
                                types: ['accelerator', 'aasdasd'],
                            },
                        ],
                    },
                    {
                        type: 'teleport',
                        x: 0,
                        y: 0,
                        w: 320,
                        h: 64,
                        translate: { x: 0, y: -11200 },
                        spawners: [
                            {
                                amount: 40,
                                radius: 0,
                                speed: 'speed',
                                types: ['accelerator', 'aasdasd'],
                            },
                        ],
                    },
                ],
            },
        ],
    }

    const data = lwf.serialize(object, schema)
    fs.writeFileSync('world.lwfb', data)

    lwf.deserialize(data, schema)

    let string = ''
    for (const e of data) {
        let r = decToHex(e)
        string += `0x${r.length === 1 ? '0' : ''}${r} `
    }
    console.log(string)
})

const schema = new lwf.Schema({
    g: {
        args: [],
        includes: ['d', 'a'],
    },
    d: {
        key: 'data',
        args: ['name'],
        includes: ['c'],
    },
    c: {
        key: 'colors',
        args: ['leaderBoard', 'fill', 'stroke', 'chat'],
    },
    a: {
        key: 'areas',
        isArray: true,
        includes: ['p', 'z'],
    },
    p: {
        key: 'properties',
        args: ['x', 'y', 'w', 'h'],
        includes: ['z'],
    },
    z: {
        key: 'zones',
        isArray: true,
        args: ['type', 'x', 'y', 'w', 'h'],
        includes: ['s', 'l'],
    },
    l: {
        key: 'translate',
        args: ['x', 'y'],
    },
    s: {
        key: 'spawners',
        isArray: true,
        args: ['speed', 'radius', 'amount'],
        includes: ['t'],
    },
    t: {
        key: 'types',
        isArray: true,
        arrayContainValues: true,
    },
})

const object = {
    data: {
        name: 'Test Map',
        color: {
            fill: '#ffffff',
        },
    },
    areas: [
        {
            properties: {
                x: 0.0005,
                y: 0.0005,
                w: 0.0005,
                h: 0.0005,
            },
            zones: [{ type: 'teleport', x: 0, y: 0, w: 320, h: 64 }],
        },
    ],
}

var hexchar = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'].map(
    (v) => v.toString()
)
function decToHex(num) {
    let out = num & 15
    num = num >>> 4
    return num ? decToHex(num) + hexchar[out] : hexchar[out]
}
