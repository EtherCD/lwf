import { SchemaError } from "../errors"
import { ProcessedSchema, RawSchema, SchemaValue } from "../types"

/**
 * Scheme for serialization and deserialization of objects.
 *
 * **Should not be changed after the object is encoded.**
 * @param raw Your schema
 */
export class Schema {
    private value: ProcessedSchema

    constructor(raw: RawSchema) {
        this.process(raw)
    }

    getSchema(index: number): SchemaValue {
        const result = this.value[index]
        if (!result) {
            throw new SchemaError(
                "Trying get not exist schema, " + index.toString(16),
                index.toString(16),
                true
            )
        }
        return result
    }

    private process(raw: RawSchema) {
        const result: ProcessedSchema = []
        const indexes = Object.keys(raw)

        const indexMap = new Map<string, number>()
        indexes.forEach((key, i) => indexMap.set(key, i))

        const parentChains: number[][] = Array(indexes.length)
            .fill(null)
            .map(() => [])

        for (let i = 0; i < indexes.length; i++) {
            const index = indexes[i]
            const val = raw[index]
            const processed = { ...val } as SchemaValue

            const nestedI: number[] = []
            const nestedK: string[] = []

            if (val.nested) {
                for (const nestedKey of val.nested) {
                    const nestedIndex = indexMap.get(nestedKey)
                    if (nestedIndex === undefined) {
                        throw new SchemaError(
                            `Trying to include non-existent schema in \`${index}\`, includes \`${nestedKey}\``,
                            index
                        )
                    }

                    nestedI.push(nestedIndex)
                    nestedK.push(raw[nestedKey].key + "")

                    parentChains[nestedIndex] = [...parentChains[i], i]
                }
            }

            processed.nestedI = nestedI.length ? nestedI : undefined
            processed.nestedK = nestedK.length ? nestedK : undefined
            processed.nestingDepth = parentChains[i].length + 1

            result.push(processed)
        }

        this.value = result
    }
}
