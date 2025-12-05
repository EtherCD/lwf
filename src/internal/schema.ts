import { SchemaError } from "../errors"
import { ProcessedSchema, RawSchema, SchemaValue } from "../types"

/**
 * Scheme for serialization and deserialization of objects.
 *
 * Should not be changed after the object is built.
 * @param raw raw Schema
 */
export class Schema {
    private value: ProcessedSchema

    constructor(raw: RawSchema) {
        const result: Record<number, ProcessedSchema> = {}
        const indexes = Object.keys(raw)

        const indexMap = new Map<string, number>()
        let currentIndex = 0
        for (const key of indexes) {
            while (currentIndex === 10 || currentIndex === 11) currentIndex++
            indexMap.set(key, currentIndex)
            currentIndex++
        }

        const parentChains: number[][] = Array(indexes.length)
            .fill(null)
            .map(() => [])

        for (let i = 0; i < indexes.length; i++) {
            const key = indexes[i]
            const val = raw[key]
            const processed = { ...val } as SchemaValue

            const nestedI: number[] = []
            const nestedK: string[] = []

            if (val.nested) {
                for (const nestedKey of val.nested) {
                    const nestedIndex = indexMap.get(nestedKey)
                    if (nestedIndex === undefined) {
                        throw new SchemaError(
                            `Trying to include non-existent schema in \`${key}\`, includes \`${nestedKey}\``
                        )
                    }

                    nestedI.push(nestedIndex)
                    nestedK.push(raw[nestedKey].key + "")

                    parentChains[nestedIndex] = [
                        ...parentChains[i],
                        indexMap.get(key)!
                    ]
                }
            }

            processed.nestedI = nestedI.length ? nestedI : undefined
            processed.nestedK = nestedK.length ? nestedK : undefined

            result[indexMap.get(key)] = processed
        }

        this.value = result
    }

    getSchema(index: number): SchemaValue {
        const result = this.value[index]
        if (!result) {
            throw new SchemaError(
                "Trying get not exist schema, " + index.toString(16)
            )
        }
        return result
    }
}
