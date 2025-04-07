export type HexNumber = number

export type RawSchema = Record<string, RawSchemaValue>
export type ProcessedSchema = SchemaValue[]

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
    /**
     * Nesting depth
     */
    nestingDepth?: number
}

export type GenericSchemaValues = string

/**
 * Types of values.
 */
export enum TypeByte {
    VarInt32 = 0x00,
    UVarInt32 = 0x01,
    VarInt64 = 0x02,
    UVarInt64 = 0x03,
    VarIntBN = 0x04,
    FloatFE = 0x05,
    FloatIEEE = 0x06,
    False = 0x07,
    True = 0x08,
    String = 0x09,
    Null = 0x0a,
    Empty = 0x0b,
    EmptyCount = 0x0c
}

/**
 * obj, overrideIndex, isArrayWithoutObjects, key
 */
export type WriteStackValue = [Object, number?, boolean?, string?]

export type ReadStackValue = {
    parent: any
    key: string | number | null
}
