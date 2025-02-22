import { LexerError } from './errors'
import * as types from './types'

export default class LWFLexer {
  input: string
  length: number
  position: number
  tokens: Array<types.LexerToken>

  static tokenTypes: Record<string, types.LexerTokenType> = {
    '[': types.LexerTokenType.LBRACKET,
    ']': types.LexerTokenType.RBRACKET,
    ',': types.LexerTokenType.COMMA,
    '-': types.LexerTokenType.MINUS,
  }

  static tokenKeys: Array<string> = ['[', ']', ',', '-']

  constructor(input: string) {
    this.input = input
    this.length = input.length
    this.position = 0
    this.tokens = []
  }

  tokenize(): Array<types.LexerToken> {
    try {
      while (this.position < this.length) {
        let char = this.peek(0)

        //@ts-ignore
        if ((!isNaN(char) && !isNaN(parseFloat(char))) || char === '-') this.number()
        else if (LWFLexer.tokenKeys.indexOf(char) !== -1 && !(this.peek(1) === ',' && char === ',')) {
          this.addToken(LWFLexer.tokenTypes[char], char)
          this.next()
        } else if (this.peek(1) === ',' && char === ',') {
          this.next()
          this.next()
          this.addToken(types.LexerTokenType.NOTHING, null)
        } else if (char != '\n' && char !== ',') this.text()
        else this.next()
      }
    } catch (e) {
      console.error(e)
    }

    return this.tokens
  }

  private number() {
    let buffer = ''
    let current = this.peek(0)
    while (true) {
      if (current === '.') {
        if (buffer.indexOf('.') != -1) throw new LexerError('Invalid float number', this.position)
      } else if (!!Number.isNaN(current) && current !== '-') {
        break
      }
      if (current === ',' || current === ']') {
        break
      }

      buffer += current
      current = this.next()
    }
    this.addToken(types.LexerTokenType.NUMBER, buffer.indexOf('.') != -1 ? parseFloat(buffer) : parseInt(buffer))
  }

  private text() {
    let buffer = ''
    let current = this.peek(0)
    while (true) {
      if (current === ',' || current === ']' || current === '[')
        if (!buffer.includes('(') || (buffer.includes('(') && buffer.includes(')'))) break
      buffer += current
      current = this.next()
    }
    if (buffer === 'true' || buffer === 'false')
      this.addToken(types.LexerTokenType.BOOLEAN, buffer === 'true' ? true : false)
    else this.addToken(types.LexerTokenType.STRING, buffer)
  }

  private next() {
    this.position++
    return this.peek(0)
  }

  private peek(index: number): string {
    let position = this.position + index
    if (position >= this.length) return '\0'
    return this.input[position]
  }

  private addToken(type: types.LexerTokenType, value: number | string | boolean | null) {
    this.tokens.push({
      type,
      value,
    })
  }
}
