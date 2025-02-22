import { SchemaError } from './errors'
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

export const toLazyFormat = (input: Record<string, any>, schema: LWFHeader, prefix?: string) => {
  const keys = Object.keys(input)
  const elements: Array<any> = schema.args.map((key) => (keys.indexOf(key) !== -1 ? input[key] : null))

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
      if (header.root !== undefined && this.root === undefined) this.root = header
      else if (header.root && this.root !== undefined)
        throw new SchemaError('Duplicates of root headers. Header key: ' + i, header)
    }
  }
}
