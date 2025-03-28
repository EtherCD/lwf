import { serialize } from '../src'
import { deserialize } from '../src/deserialize'

test('Deser tests', () => {
    const schema = {
        a: {
            args: ['name', 'age', 'status', 'developer'],
            includes: ['b'],
        },
        b: {
            key: 'badges',
            isArray: true,
            arrayContainValues: true,
            args: ['Summer', 'Autumn', 'Winter', 'Spring'],
        },
    }
    const buffer = serialize(
        {
            developer: true,
            name: 'EtherCD',
            status: 'Jr. Dev',
            age: -4594359435945,
        },
        schema
    )
    deserialize(buffer, schema)
})
