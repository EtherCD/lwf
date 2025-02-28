import { LWFSchemaError } from './errors'
import LWFLexer from './lexer'
import { LexerTokenType, LWFHeader, LWFSchema, ParsedArgs } from './types'

export const auto = (elements: Array<ParsedArgs>, header: LWFHeader) => {
  let list = header.args
  let requiredArgs = header.requiredArgs ?? []
  let out: Record<string, any> = {}
  for (let i = 0; i < elements.length; i++) {
    const e = elements[i]
    if (list[i] === null) continue
    if (e.type != LexerTokenType.NOTHING) {
      out[list[i]!] = elements[i].value
    } else {
      const f = requiredArgs.filter((e) => e[0] === list[i])
      if (f.length !== 0) {
        out[list[i]!] = f[0][1]
      }
    }
  }
  return out
}

export const toLazyFormat = (
  input: Record<string, any>,
  schema: LWFHeader,
  prefix?: string
) => {
  const keys = Object.keys(input)
  const elements: Array<any> = schema.args.map((key) => {
    if (keys.indexOf(key) !== -1) {
      if (typeof input[key] === 'string')
        return input[key].replace(/([\[\]\,\+\-])/g, '\\$1')
      else if (typeof input[key] === 'boolean') return input[key] ? '+' : '-'
      return input[key]
    } else return null
  })

  let output = '[' + (prefix ? prefix + ',' : '')
  for (const i in elements) {
    let element = elements[i]
    if (typeof element === 'string' && element.length === 0) element = '\0'
    output += elements[i] === null ? ',,' : elements[i] + ','
  }
  output += ']'
  output = output.replace(/,+\]/g, ']')

  return output
}

export class LWFSchemaPrepare {
  root?: LWFHeader
  headers: LWFSchema

  constructor(schema: LWFSchema, stringify?: boolean) {
    if (stringify) {
      let out: Record<string, LWFHeader> = {}

      for (const s in schema) {
        const scheme = schema[s]
        out[scheme.key] = { ...scheme, key: s }
      }

      this.headers = out
    } else this.headers = schema

    for (const i in this.headers) {
      let header = this.headers[i]
      if (header.root !== undefined && this.root === undefined)
        this.root = header
      else if (header.root && this.root !== undefined)
        throw new LWFSchemaError(
          'Duplicates of root headers. Header key: ' + i,
          header
        )
    }
  }
}

export class SchemaGenerator {
  private static headersList: Array<string> = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    '',
  ]
  private static currentHeader: number = 0

  static generate(obj: Array<any> | Record<any, any>): LWFSchema {
    let schema: LWFSchema = {}

    if (Array.isArray(obj)) this.processArray(obj, schema)
    else this.processObject(obj, schema)

    return schema
  }

  private static processArray(obj: Array<any>, schema: LWFSchema) {
    let newSchema = {}
  }

  private static processObject(obj: Record<any, any>, schema: LWFSchema) {}
}
