import { LWFLexerError } from './errors'
import * as types from './types'

export default class LWFLexer {
  input: string
  length: number
  position: number
  tokens: Array<types.LexerToken>
  lastPosition: number

  static tokenTypes: Record<string, types.LexerTokenType> = {
    '[': types.LexerTokenType.LBRACKET,
    ']': types.LexerTokenType.RBRACKET,
    ',': types.LexerTokenType.COMMA,
    '-': types.LexerTokenType.MINUS,
    '+': types.LexerTokenType.PLUS,
  }

  static tokenKeys: Array<string> = ['[', ']', ',', '-', '+']

  constructor(input: string) {
    this.input = input
    this.length = input.length
    this.position = 0
    this.lastPosition = -1
    this.tokens = []
  }

  tokenize(): Array<types.LexerToken> {
    try {
      while (this.position < this.length) {
        let char = this.peek(0)

        //@ts-ignore
        if (
          this.checkCharIsNumber(char) ||
          (char === '-' && this.checkCharIsNumber(this.peek(1)))
        )
          this.number()
        else if (char === '+' || char === '-') {
          this.addToken(
            types.LexerTokenType.BOOLEAN,
            char === '+' ? true : false
          )
          this.next()
        } else if (
          LWFLexer.tokenKeys.indexOf(char) !== -1 &&
          !(this.peek(1) === ',' && char === ',')
        ) {
          this.addToken(LWFLexer.tokenTypes[char], char)
          this.next()
        } else if (this.peek(1) === ',' && char === ',') {
          this.next()
          this.next()
          this.addToken(types.LexerTokenType.NOTHING, null)
        } else if (char != '\n' && char !== ',') this.text()
        else this.next()

        if (this.lastPosition === this.position)
          throw new LWFLexerError(
            'The lexer goes to infinity when trying to process data. The symbol that causes the error: ' +
              char,
            this.position
          )
        this.lastPosition = this.position
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
        if (buffer.indexOf('.') != -1)
          throw new LWFLexerError('Invalid float number', this.position)
      } else if (!!Number.isNaN(current) && current !== '-') {
        break
      }
      if (current === ',' || current === ']') {
        break
      }

      buffer += current
      current = this.next()
    }
    this.addToken(
      types.LexerTokenType.NUMBER,
      buffer.indexOf('.') != -1 ? parseFloat(buffer) : parseInt(buffer)
    )
  }

  private text() {
    let buffer = ''
    let current = this.peek(0)
    let nextCharShielded = false
    while (true) {
      if (!nextCharShielded) {
        if (current === ',' || current === ']' || current === '[') break
      } else nextCharShielded = false

      if (current === '\\' && !nextCharShielded) {
        nextCharShielded = true
      } else buffer += current

      current = this.next()
    }
    this.addToken(types.LexerTokenType.STRING, buffer)
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

  private checkCharIsNumber(char: string) {
    //@ts-ignore
    return !isNaN(char) && !isNaN(parseFloat(char))
  }

  private addToken(
    type: types.LexerTokenType,
    value: number | string | boolean | null
  ) {
    this.tokens.push({
      type,
      value,
    })
  }
}
