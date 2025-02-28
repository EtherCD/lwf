import LWFLexer from '../src/lexer'
import { LexerTokenType } from '../src/types'

const testFile = 'a[1,-2,Leaf,rgb(10\\,20\\,30),+,,,]'

export const lexerTest = [
  { type: LexerTokenType.STRING, value: 'a' },
  { type: LexerTokenType.LBRACKET, value: '[' },
  { type: LexerTokenType.NUMBER, value: 1 },
  { type: LexerTokenType.COMMA, value: ',' },
  { type: LexerTokenType.NUMBER, value: -2 },
  { type: LexerTokenType.COMMA, value: ',' },
  { type: LexerTokenType.STRING, value: 'Leaf' },
  { type: LexerTokenType.COMMA, value: ',' },
  { type: LexerTokenType.STRING, value: 'rgb(10,20,30)' },
  { type: LexerTokenType.COMMA, value: ',' },
  { type: LexerTokenType.BOOLEAN, value: true },
  { type: LexerTokenType.NOTHING, value: null },
  { type: LexerTokenType.COMMA, value: ',' },
  { type: LexerTokenType.RBRACKET, value: ']' },
]

test('Lexer all features', () => {
  const lexer = new LWFLexer(testFile)
  expect(lexer.tokenize()).toStrictEqual(lexerTest)
})
