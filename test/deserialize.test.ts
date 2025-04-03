import { deepStrictEqual } from 'assert'
import lwf from '../src'
import { Schema } from '../src/internal/schema'
import fs from 'fs'

const pixels: { x: number; y: number; color: string }[] = []
for (let x = 0; x < 255; x++)
    for (let y = 0; y < 255; y++) pixels.push({ x, y, color: '#000000' })

const obj = {
    width: 255,
    height: 255,
    pixels,
}

test('Deser tests', () => {
    const schema = new Schema({
        a: {
            args: ['width', 'height'],
            includes: ['b'],
        },
        b: {
            args: ['x', 'y', 'color'],
            isArray: true,
            key: 'pixels',
        },
    })

    const buffer = lwf.serialize(obj, schema)

    deepStrictEqual(lwf.deserialize(buffer, schema), obj)
})
