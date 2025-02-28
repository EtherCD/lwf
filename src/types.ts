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
  PLUS,
}

export interface ParsedBlock {
  index: string
  args: Array<ParsedArgs>
}

export interface ParsedArgs {
  type: string | number
  value: string | number | null | boolean
}

/**
 * Object key - table of contents of the data block
 * Object value - the scheme by which the data block will be compared to the final object
 */
export type LWFSchema = {
  [key: string]: LWFHeader
}

/**
 * Data block diagram indicating how data can be expanded and what data can be nested
 */
export type LWFHeader = {
  /**
   * The key to this is that the data block will be written in the final object
   */
  key: string
  /**
   * Specifies the key by which data will be written inside a child object relative to the current object
   */
  in?: string
  /**
   * Indicates whether the schema is the root for the entire object, this allows you to describe what the final object is like
   */
  root?: boolean
  /**
   * Indicates a list of keys by which data will be recorded or taken from the object being parsed,
   * and indicates the order in which data is written from the object
   */
  args: Array<string>
  /**
   * A list of nested objects must contain a table of contents of the objects inside
   */
  includes?: Array<string>
  /**
   * Indicates the recording principle for subsequent data blocks of the same type. Will write the following objects to the array sequentially
   */
  isArray?: boolean
  /**
   * Indicates the recording principle for subsequent data blocks of the same type. Records data on keys that point to child objects within
   */
  isKeyedObject?: boolean
  /**
   * Specifies which arguments are required. Because the format skips all empty elements.
   * ["required argument", "substitute if argument is empty"]
   */
  requiredArgs?: Array<[string, string | number]>
}
