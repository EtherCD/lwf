import { LWFHeader, ParsedBlock } from './types'

export class LexerError extends Error {
  pos: number
  constructor(message: string, pos: number) {
    super(message)
    this.pos = pos
  }
}

export class ParsingError extends Error {
  block: ParsedBlock
  header: LWFHeader
  constructor(message: string, block: ParsedBlock, header: LWFHeader) {
    super(message)
    this.block = block
    this.header = header
  }
}

export class StringifyError extends Error {
  obj: Object
  header: LWFHeader
  constructor(message: string, obj: Object, header: LWFHeader) {
    super(message)
    this.obj = obj
    this.header = header
  }
}

export class SchemaError extends Error {
  header: LWFHeader
  constructor(message: string, header: LWFHeader) {
    super(message)
    this.header = header
  }
}
