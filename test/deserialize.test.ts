import { deepStrictEqual } from 'assert'
import lwf from '../src'
import { Schema } from '../src/internal/schema'
import fs from 'fs'

const pixels: { x: number; y: number; color: string }[] = []
for (let x = 0; x < 10; x++)
    for (let y = 0; y < 10; y++) pixels.push({ x, y, color: '#000000' })

const obj = {
    properties: [20, 20, 20, { lite: true }, 20],
    players: {
        0: {
            name: 'EtherCD',
        },
    },
}

test('Deser tests', () => {
    const schema = new Schema({
        a: {
            args: ['width', 'height'],
            includes: ['b', 'c', 'd'],
        },
        b: {
            args: ['x', 'y', 'color'],
            isArray: true,
            key: 'pixels',
        },
        c: {
            args: ['lite'],
            isArray: true,
            canContainNotObjects: true,
            key: 'properties',
        },
        d: {
            args: ['name'],
            key: 'players',
            isKeyedObject: true,
        },
    })

    const buffer = lwf.serialize(obj, schema)

    const out = lwf.deserialize(buffer, schema)

    console.log(out)

    deepStrictEqual(out, obj)
})
