export type HexNumber = number

export type RawSchema = Record<string, StaticTypedSchema>
export type Schema = Record<string, ProcessedSchemaValue>

export type SingleSchema = ProcessedSchemaValue
export type RawSingleSchema = StaticTypedSchema

export type StaticTypedSchema = {
    /**
     * Specifies which fields will be converted and their sequence when writing.
     *
     * NOTE: It is better to specify the order from those data that are most often present to those that are absent, so that the data is recorded more compactly.
     */
    args?: GenericSchemaValues[]
    /**
     * Specifies the key by which the object will be written to the top object of the structure
     */
    key?: GenericSchemaValues
    /**
     * Can write data more efficient with static typed values.
     */
    types?: (typeof TypeSchema)[keyof typeof TypeSchema][]
    /**
     * Indicates which schemas are nested inside
     */
    includes?: string[]
    /**
     * Specifies that the diagram will describe objects within the array.
     */
    isArray?: boolean
    /**
     * Indicates that the array may contain more than just objects, and that they should be written in the correct order.
     */
    arrayContainValues?: boolean
    /**
     * An object described by the principle [unique key]: value. Will be written as the same data blocks, but a key will be placed at the beginning of them
     */
    isKeyedObject?: boolean
}

export type ProcessedSchemaValue = StaticTypedSchema & {
    /**
     * Indicates which schemas are nested inside
     */
    includesIndexes?: number[]
    /**
     * Indicates which schemas are nested inside
     */
    includesObjects?: string[]
}

export type GenericSchemaValues = number | string

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
    Bool = 0x07,
    String = 0x08,
    Null = 0x09,
    Empty = 0x0a,
    EmptyCount = 0x0b,
}

export const TypeSchema = {
    Any: 'any',
    Int: 'int',
    Bool: 'bool',
    Char: 'char',
    String: 'str',
}

export type ByteDepth = 8 | 16 | 32 | 64

export type VarsContext = {
    buffer: Uint8Array
    offset: number

    ensure: (elements: number) => void
    write: (byte: number) => void
    read: () => number

    schema: SingleSchema[]
}

export type WriteBlockContext = VarsContext & {
    sOffset: number
    nested: [object, number?][]
}

export type ReadBlockContext = VarsContext & {
    readBuffer: Map<number, Object>
}
