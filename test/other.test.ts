import lwf from '../src'
import { Schema } from '../src/internal/schema'

test('Lol', () => {
    const schema = new Schema({
        a: {
            args: ['name', 'age', 'status', 'developer'],
            includes: ['b'],
        },
        b: {
            key: 'badges',
            isArray: true,
            canContainNotObjects: true,
            args: ['Summer', 'Autumn', 'Winter', 'Spring'],
        },
    })
    const buffer = lwf.serialize(
        {
            developer: true,
            name: 'EtherCD',
            status: 'Jr. Dev',
            age: -4594359435945,
            badges: [
                {
                    Summer: true,
                    Winter: true,
                },
            ],
        },
        schema
    )

    let string = ''
    for (const e of buffer) {
        let r = decToHex(e)
        string += `0x${r.length === 1 ? '0' : ''}${r} `
    }
    console.log(string)
})

var hexchar = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'].map(
    (v) => v.toString()
)
function decToHex(num) {
    let out = num & 15
    num = num >>> 4
    return num ? decToHex(num) + hexchar[out] : hexchar[out]
}
