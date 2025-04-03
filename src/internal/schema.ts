import { SchemaError } from '../errors'
import { ProcessedSchema, RawSchema, SchemaValue } from '../types'

export class Schema {
    value: ProcessedSchema

    constructor(raw: RawSchema) {
        this.value = this.process(raw)
    }

    get(index: number): SchemaValue {
        const result = this.value[index]
        if (!result) {
            console.log(index)
            throw new SchemaError('')
        }
        return result
    }

    private process(raw: RawSchema): ProcessedSchema {
        let result: ProcessedSchema = []
        const indexes = Object.keys(raw)
        let depthMap = new Map<string, number>()

        for (const index of indexes) {
            const val = raw[index]
            const processed = { ...val } as SchemaValue

            let depth = (depthMap.get(index) ?? 0) + 1

            if (val.includes) {
                let includesIndexes: number[] = []
                let includesObjects: string[] = []

                for (const key of val.includes) {
                    const includeIndex = indexes.indexOf(key)
                    if (includeIndex === -1) {
                        throw new SchemaError(
                            `Trying to include non-existent schema in \`${index}\`, includes \`${key}\``
                        )
                    }

                    includesIndexes.push(includeIndex)
                    includesObjects.push(raw[key].key + '')

                    depthMap.set(key, depth)
                }
                processed.includesIndexes = includesIndexes
                processed.includesObjects = includesObjects
            }

            processed.nestingDepth = depth

            if (!val.isArray && !val.isKeyedObject) {
                if (!val.args) {
                    throw new SchemaError(
                        `In schema with key \`${val.key}\`, args must be described`
                    )
                }
            }

            result.push(processed)
        }

        return result
    }
}
