import { OptionsError, SchemaError } from './errors'
import {
    HexNumber,
    Options,
    ProcessedSchemaValue,
    RawSchema,
    Schema,
    SingleSchema,
} from './types'

export function processOptions(options: Options = {}): Required<Options> {
    let result: Required<Options> = {}
    return result
}

export function processSchema(schema: RawSchema): SingleSchema[] {
    const keys = Object.keys(schema)
    let schemas = []
    for (const key in schema) {
        const value = schema[key]
        const index = keys.indexOf(key)
        if (value.includes) {
            let includes = []
            let includesKeys = []
            for (const v of value.includes) {
                const index = keys.indexOf(v)
                if (index === -1) {
                    throw new SchemaError(
                        `Trying include not exists schema \`${key}\` includes ${v}`
                    )
                } else {
                    includesKeys.push(v)
                    includes.push(index)
                }
            }
            value.includes = includes
        }
        schemas.push(value)
        if (value.isArray || value.isKeyedObject) {
        } else {
            if (!value.args)
                throw new SchemaError(
                    `In schema with key \`${key}\` args must be described`
                )
            if (index !== 0 && !value.key)
                throw new SchemaError(
                    `In schema with key \`${key}\` key must be described`
                )
        }
    }
    return schemas
}

export function checkType() {}

export const toInt8: Record<number, (N: number) => HexNumber[]> = {
    8: (N): number[] => [N & 0xff],
    16: (N): number[] => [(N >> 8) & 0xff, N & 0xff],
    32: (N): number[] => [
        (N >> 24) & 0xff,
        (N >> 16) & 0xff,
        (N >> 8) & 0xff,
        N & 0xff,
    ],
    64: (N): number[] => [
        (N >> 56) & 0xff,
        (N >> 48) & 0xff,
        (N >> 40) & 0xff,
        (N >> 32) & 0xff,
        (N >> 24) & 0xff,
        (N >> 16) & 0xff,
        (N >> 8) & 0xff,
        N & 0xff,
    ],
}
