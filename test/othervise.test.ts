import lwf from '../src'

test('asda', () => {
    const schema = new lwf.Schema({
        a: {
            includes: ['b'],
            isArray: true,
            canContainNotObjects: true,
        },
        b: {
            key: 'a',
            args: ['b'],
        },
    })
    const obj = [20, { a: { b: 120 } }, 20, 17, 17, { a: { b: 120 } }, 20]

    const startTime = Date.now()

    let ops = 0
    while (Date.now() - startTime < 1000) {
        lwf.serialize(obj, schema)
        ops++
    }

    console.log(lwf.serialize(obj, schema))

    console.log(ops)
})
