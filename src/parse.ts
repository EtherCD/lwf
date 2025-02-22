import { LexerToken, LexerTokenType, ParsedBlock } from './types'

export class LWFParser {
  tokens: Array<LexerToken> = []
  position = 0
  length = 0
  nodes: Array<ParsedBlock> = []

  inNode = false

  constructor(tokens: Array<LexerToken>) {
    this.tokens = tokens
    this.length = tokens.length
  }

  parse(): Array<ParsedBlock> {
    try {
      while (this.position < this.length) {
        let token = this.peek(0)

        if (token.type == LexerTokenType.STRING && this.peek(1).type == LexerTokenType.LBRACKET) this.node()
        else this.next()
      }
    } catch (e) {
      console.error(e)
    }

    return this.nodes
  }

  node() {
    let token = this.peek(0)
    let node: ParsedBlock = { index: token.value + '', args: [] }
    token = this.next()
    while (token.type !== LexerTokenType.RBRACKET) {
      if ([LexerTokenType.NOTHING, LexerTokenType.STRING, LexerTokenType.BOOLEAN].includes(token.type)) {
        node.args.push({
          type: token.type,
          value: token.value,
        })
      }
      if (token.type === LexerTokenType.NUMBER) {
        node.args.push({
          type: Number(token.type),
          value: token.value,
        })
      }

      token = this.next()
    }

    this.nodes.push(node)
  }

  private next() {
    this.position++
    return this.peek(0)
  }

  private peek(index: number) {
    let position = this.position + index
    return this.tokens[position]
  }
}
