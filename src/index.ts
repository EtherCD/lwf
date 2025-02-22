import { ParsingError, SchemaError, StringifyError } from './errors'
import LWFLexer from './lexer'
import { LWFParser } from './parse'
import { auto, LWFSchemaPrepare, toLazyFormat } from './schema'
import { LWFHeader, LWFSchema, ParsedBlock } from './types'

export class LWF {
  private static parseSchema: LWFSchemaPrepare
  private static index: number = 0
  private static blocks: ParsedBlock[] = []
  private static stringifySchema: LWFSchemaPrepare

  /**
   * Parse lwf data to object
   * @param input text of file
   * @param schema LWFSchema
   * @returns Object
   * @example Usage with schema
   * const schema: LWFSchema = { a: { key: "data", args: [ "name", "email", "age" ] } }
   * const code = "a[EtherCD,secret@email,some random numbers]"
   * const result = LWF.parse(code, schema) as { data: { name: "EtherCD", email: "secret@email", age: "some random numbers " } }
   */
  static parse(input: string, schema: LWFSchema): any {
    const lexer = new LWFLexer(input)
    const parser = new LWFParser(lexer.tokenize())
    this.blocks = parser.parse()
    this.parseSchema = new LWFSchemaPrepare(schema)
    this.index = 0

    let result: any

    if (this.parseSchema.root && this.parseSchema.root!.isArray) {
      result = []
    } else result = {}

    while (this.index < this.blocks.length) {
      this.parseBlock(this.blocks[this.index], result)
    }

    return result
  }

  private static parseBlock(block: ParsedBlock, result: Array<any> | Record<string, any>) {
    const header = this.parseSchema.headers[block.index]

    if (!header) {
      throw new ParsingError('Index of data block is not exists in scheme: ' + block.index, block, header)
    }

    let args = header.isKeyedObject ? block.args.filter((_, i) => i !== 0) : block.args

    if (header.args.length === 0 && !header.isArray)
      throw new ParsingError(
        'Args for block data is not set, or make sure header ' + block.index + ' is array',
        block,
        header
      )

    let included =
      header.args.length === 0 && header.key.length !== 0 ? block.args.map((e) => e.value) : auto(args, header)

    if (header.in) included = { [header.in]: included }

    this.index++

    while (this.index < this.blocks.length) {
      const nextBlock = this.blocks[this.index]

      if (header.includes?.includes(nextBlock.index)) {
        this.parseBlock(nextBlock, included)
      } else {
        break
      }
    }

    if (Array.isArray(result)) {
      result.push(included)
      return
    }

    if (header.isKeyedObject && !header.root) {
      if (!result[header.key]) result[header.key] = {}
      if (block.args.length === 0) {
        result[header.key] = {}
        return
      }
      let key = block.args[0].value
      if (typeof key === 'string' || typeof key === 'number') result[header.key][key] = included
      return
    }

    if (header.isKeyedObject && header.root) {
      if (block.args.length === 0) {
        return
      }
      let key = block.args[0].value
      if (typeof key === 'string' || typeof key === 'number') result[key] = included
      return
    }

    if (header.isArray) {
      if (!Array.isArray(result[header.key])) {
        result[header.key] = []
      }
      if (Array.isArray(included)) included.map((e) => result[header.key].push(e))
      else result[header.key].push(included)
      return
    }

    result[header.key] = included
  }

  /**
   * Stringify lwf data
   * @param input Object or Array
   * @param schema LWFSchema
   * @returns string
   * @example Usage with schema
   * const schema: LWFSchema = { a: { key: "data", args: [ "name", "email", "age" ] } }
   * const data = { data: { name: "EtherCD", email: "secret@email", age: "some random numbers " } }
   * const result = LWF.stringify(data, schema) as "a[EtherCD,secret@email,some random numbers]"
   */
  static stringify(input: Record<string, any> | Array<any>, inputSchema: LWFSchema): string {
    const result: string[] = []

    this.stringifySchema = new LWFSchemaPrepare(inputSchema, true)
    let schema = this.stringifySchema
    let headers = schema.headers

    if (Array.isArray(input)) {
      if (schema.root !== undefined && schema.root.isArray)
        for (const i in input) this.stringifyBlock(input[i], schema.root, result)
      else {
        throw new StringifyError(
          'Input object is array, but in schema root header is not set as `isArray`',
          input,
          schema.root!
        )
      }
    } else
      Object.keys(input).forEach((key) => {
        const block = schema.root ? schema.root : headers[key]

        if (!block) {
          throw new StringifyError(`Unknown schema key: ${key}`, input[key], block)
        }

        this.stringifyBlock(input[key], block, result, schema.root && schema.root.isKeyedObject ? key : undefined)
      })

    return result.join('')
  }

  private static stringifyBlock(
    data: Record<string, any> | Array<Record<string, any>>,
    header: LWFHeader,
    result: string[],
    prefix?: string
  ) {
    if (header.isKeyedObject) {
      let overrideData = data as Record<string, Record<string, any>>
      if (header.args.length !== 0)
        if (header.root) this.stringifyBlock(overrideData, { ...header, isKeyedObject: false }, result, prefix)
        else {
          const keys = Object.keys(overrideData)
          if (keys.length === 0) result.push(header.key + '[]')
          keys.forEach((i) => this.stringifyBlock(overrideData[i], { ...header, isKeyedObject: false }, result, i))
        }
      else
        throw new StringifyError(
          'Arguments must been exists in keyedObject. Header key: ' + header.key,
          overrideData,
          header
        )

      return
    }

    if (header.isArray && Array.isArray(data)) {
      if (header.args.length !== 0) data.forEach((item) => this.stringifyBlock(item, header, result))
      else result.push(header.key + `[${data.join(',')}]`)
      return
    }

    data = data as Record<string, any>

    const i = header.key + toLazyFormat(header.in ? data[header.in] : data, header, prefix)

    result.push(i)

    for (const i in data) {
      if (typeof data[i] === 'object') {
        if (header.in !== i) {
          if (!this.stringifySchema.headers[i]) {
            throw new StringifyError(`Unknown schema key: ${i}`, data[i], header)
          }
          this.stringifyBlock(data[i], this.stringifySchema.headers[i], result)
        }
      }
    }
  }
}

export { LWFSchema, LWFHeader } from './types'

export { LexerError, ParsingError, StringifyError, SchemaError } from './errors'
