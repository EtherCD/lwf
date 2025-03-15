import { LWF } from 'lwf'
import * as lwf from '../src'

test('Test sizes of serialized data', () => {
    const table = [{ LWFB: 0, LWF: 0, JSON: 0 }]

    var time1 = Date.now()
    const binaryData = lwf.serialize(object, schema)
    table[0]['LWFB'] = Date.now() - time1
    time1 = Date.now()
    const oldData = LWF.stringify(object, schema)
    table[0]['LWF'] = Date.now() - time1
    time1 = Date.now()
    const jsonData = JSON.stringify(object)
    table[0]['JSON'] = Date.now() - time1

    console.table(table)

    console.log('Size in json: ' + Math.round(jsonData.length / 10.24) / 100)
    console.log('Size in lwf: ' + Math.round(oldData.length / 10.24) / 100)
    console.log('Size in lwfb: ' + Math.round(binaryData.length / 10.24) / 100)
})

const schema = {
    a: {
        key: 'pixels',
        args: ['x', 'y', 'color'],
        isArray: true,
    },
}

const widthHeight = 200

const object: {
    pixels: Array<{ x: number; y: number; color: string }>
} = { pixels: [] }

for (let y = 0; y < widthHeight; y++)
    for (let x = 0; x < widthHeight; x++)
        object.pixels.push({
            x,
            y,
            color: '#000000',
        })
