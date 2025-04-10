export class LwfError extends Error {}

export class SchemaError extends LwfError {
    public keyOfSchema: string
    public isDecoding: boolean
    constructor(message: string, key: string, isDecoding?: boolean) {
        super(message)
        this.keyOfSchema = key
        this.isDecoding = isDecoding ?? false
    }
}

export class EncodeError extends LwfError {
    value: unknown
    constructor(message: string, value: unknown) {
        super(message)
        this.value = value
    }
}

export class DecodeError extends LwfError {
    constructor(message: string) {
        super(message)
    }
}
