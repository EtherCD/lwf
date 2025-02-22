export interface LexerToken {
  type: LexerTokenType
  value: string | number | null | boolean
}

export enum LexerTokenType {
  LBRACKET,
  RBRACKET,
  COMMA,
  NOTHING,
  NUMBER,
  STRING,
  BOOLEAN,
  MINUS,
}

export interface ParsedBlock {
  index: string
  args: Array<ParsedArgs>
}

export interface ParsedArgs {
  type: string | number
  value: string | number | null | boolean
}

export type LWFSchema = {
  [key: string]: LWFHeader
}

export type LWFHeader = {
  key: string
  in?: string
  root?: boolean
  args: Array<string>
  includes?: Array<string>
  isArray?: boolean
  isKeyedObject?: boolean
  requiredArgs?: Array<[string, string | number]>
}
