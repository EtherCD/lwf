import { toLazyFormat, auto } from '../src/schema'

const obj = {
  name: 'test',
  something: true,
}

const schema = {
  key: 'a',
  args: ['name', 'jar', 'something'],
}

test('Schema utils toLazyFormat', () => {
  expect(toLazyFormat(obj, schema)).toBe('[test,,,+]')
})

test('Schema utils auto', () => {
  expect(
    auto(
      [
        {
          type: '',
          value: 'test',
        },
        {
          type: '',
          value: null,
        },
        {
          type: '',
          value: true,
        },
      ],
      schema
    )
  ).toStrictEqual({
    jar: null,
    name: 'test',
    something: true,
  })
})
