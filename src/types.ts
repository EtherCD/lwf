export type HexNumber = number

export type RawSchema = Record<string, RawSchemaValue>
export type ProcessedSchema = Record<number, SchemaValue>

export type RawSchemaValue = {
    /**
     * Specifies which fields will be converted and their sequence when writing.
     *
     * NOTE: It is better to specify the order from those data that are most often present to those that are absent, so that the data is recorded more compactly.
     */
    fields?: GenericSchemaValues[]
    /**
     * Specifies the key by which the object will be written to the top object of the structure
     */
    key?: GenericSchemaValues
    /**
     * Indicates which schemas are nested inside
     */
    nested?: string[]
    /**
     * Specifies that the schema will describe objects within the array.
     */
    isArray?: boolean
    /**
     * An object described by the principle [unique key]: [Object]. Will be written as the same data blocks, but a key will be placed at the beginning of them
     */
    isMap?: boolean
}

export type SchemaValue = RawSchemaValue & {
    /**
     * Indexes of nested schemas
     */
    nestedI?: number[]
    /**
     * Keys of nested schemas
     */
    nestedK?: string[]
}

export type GenericSchemaValues = string

/**
 * Types of values.
 *
 * Limited to 15 types
 */
export enum TypeByte {
    Int = 0x00,
    Uint128,
    NUint128,
    Float,
    Double,
    FloatFE,
    NFloatFE,
    False,
    True,
    Null,
    EndOfBlock,
    EndOfBlockCount,
    Empty = 0x0e,
    EmptyCount = 0x0f
}

/**
 * obj, overrideIndex, isArrayWithoutObjects, key, nestingDepth
 */
export type WriteStackValue = [Object, number?, boolean?, string?, number?]

export type ReadStackValue = {
    parent: any
    key: string | number | null
}
