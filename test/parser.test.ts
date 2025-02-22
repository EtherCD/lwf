import { LWFParser } from '../src/parse'
import { lexerTest } from './lexer.test'

test('Parser features', () => {
  const lexer = new LWFParser(lexerTest)
  expect(lexer.parse()).toStrictEqual([
    {
      args: [
        { type: 4, value: 1 },
        { type: 4, value: -2 },
        { type: 5, value: 'Leaf' },
        { type: 5, value: 'rgb(10,20,30)' },
        { type: 6, value: true },
        { type: 3, value: null },
      ],
      index: 'a',
    },
  ])
})
