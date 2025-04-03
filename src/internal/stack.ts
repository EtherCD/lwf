import { SchemaValue, WriteStackValue } from '../types'

export class WriteStack {
    array: WriteStackValue[]

    constructor(object: Object) {
        this.array = [[object, 0]]
    }

    add(
        object: Object,
        overrideIndex: number = null,
        isArrayWithOnlyValues: boolean = null
    ) {
        this.array.push([object, overrideIndex, isArrayWithOnlyValues])
    }

    pop() {
        return this.array.pop()
    }
}

export class ReadStack {
    private object: Object
    private nested: Array<string | number> = []
    private lastRef: Object
    private arrayIndex: number = -1

    get result() {
        return this.object
    }

    constructor(schema: SchemaValue) {
        this.object = schema.isArray ? [] : {}
        this.lastRef = this.object
    }

    private updateRef() {
        this.lastRef = this.object
        for (let i = 0; i < this.nested.length; i++) {
            this.lastRef = this.lastRef[this.nested[i]]
        }
    }

    enter(field: string | number, array?: boolean) {
        if (!this.lastRef[field]) {
            this.lastRef[field] = array ? [] : {}
        }
        this.nested.push(field)
        this.updateRef()
    }

    exit(count?: number) {
        for (let i = 0; i < (count || 1); i++) {
            this.nested.pop()
        }
        this.updateRef()
    }

    startArray() {
        if (this.arrayIndex === -1) {
            this.arrayIndex = 0
        }
    }

    isLastArray() {
        return this.arrayIndex !== -1
    }

    endArray() {
        this.arrayIndex = -1
    }

    addObjectToArray() {
        this.lastRef[this.arrayIndex] = {}
        this.arrayIndex++
    }

    setValue(field: string, value: unknown) {
        if (this.arrayIndex !== -1) {
            this.lastRef[this.arrayIndex - 1][field] = value
        } else this.lastRef[field] = value
    }
}
