import { OptionsError, SchemaError } from './errors'
import {
    HexNumber,
    ProcessedSchemaValue,
    RawSchema,
    Schema,
    SingleSchema,
} from './types'

export function processSchema(schema: RawSchema): SingleSchema[] {
    const keys = Object.keys(schema)
    const newSchema = JSON.parse(JSON.stringify(schema))
    let result: SingleSchema[] = []

    for (const i of keys) {
        const element = schema[i] as SingleSchema

        if (element.includes) {
            let includesIndexes: number[] = []
            let includesObjects: string[] = []
            let ind = 0

            for (const includeKey of element.includes) {
                const includeIndex = keys.indexOf(includeKey)
                if (includeIndex === -1) {
                    throw new SchemaError(
                        `Trying to include non-existent schema: \`${includeKey}\``
                    )
                }

                includesIndexes.push(includeIndex)
                includesObjects[ind++] = newSchema[includeKey].key + ''
            }
            element.includesIndexes = includesIndexes
            element.includesObjects = includesObjects
        }

        if (!element.isArray && !element.isKeyedObject) {
            if (!element.args) {
                throw new SchemaError(
                    `In schema with key \`${element.key}\`, args must be described`
                )
            }
        }

        result.push(element)
    }

    return result
}

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
