import * as lwf from '../src'
import { Schema } from '../src/types'

test('View example in bytes', () => {
    const data = lwf.serialize(object, schema)

    let string = ''
    for (const e of data) {
        let r = decToHex(e)
        string += `0x${r.length === 1 ? '0' : ''}${r} `
    }
    console.log(string)
})

const schema: Schema = {
    a: {
        includes: ['d', 'a'],
    },
    d: {
        key: 'data',
        args: ['name'],
        includes: ['c'],
    },
    c: {
        key: 'color',
        args: ['fill'],
    },
    a: {
        key: 'areas',
        isArray: true,
        includes: ['p'],
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
    },
}

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
                x: 0,
                y: 0,
                w: 0,
                h: 0,
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
