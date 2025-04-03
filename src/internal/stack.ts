import { SchemaValue, WriteStackValue } from '../types'

export class WriteStack {
    array: WriteStackValue[]

    constructor(object: Object) {
        this.array = [[object, 0]]
    }

    add(
        object: Object,
        overrideIndex: number = null,
        isArrayWithoutObjects: boolean = null,
        key: string = null
    ) {
        this.array.push([object, overrideIndex, isArrayWithoutObjects, key])
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
        this.arrayIndex = 0
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

    addObjectToObject(key: string) {
        this.lastRef[key] = {}
    }

    addValueToArray(value: unknown) {
        this.lastRef[this.arrayIndex] = value
        this.arrayIndex++
    }

    setValueToObject(key: string, field: string, value: unknown) {
        this.lastRef[key][field] = value
    }

    setValue(field: string, value: unknown) {
        if (this.arrayIndex !== -1) {
            this.lastRef[this.arrayIndex - 1][field] = value
        } else this.lastRef[field] = value
    }
}

export class ObjectBuilder {
    stack: (Object | Array<unknown>)[]
    path: (string | number)[]

    constructor(isArray: boolean) {
        this.stack = [isArray ? [] : {}]
        this.path = []
    }

    startObject(key: string | number) {
        const newObj = {}

        if (Array.isArray(this.current)) {
            this.current.push(newObj)
        } else {
            this.current[key] = newObj
        }

        this.stack.push(newObj)
        if (key) this.path.push(key)
    }

    startArray(key: string | number) {
        const newArr = []

        if (Array.isArray(this.current)) {
            this.current.push(newArr)
        } else {
            this.current[key] = newArr
        }

        this.stack.push(newArr)
        if (key) this.path.push(key)
    }

    setValue(key: string | number, value: unknown) {
        if (Array.isArray(this.current)) {
            this.current.push(value)
        } else {
            this.current[key] = value
        }
    }

    end() {
        if (this.stack.length > 1) {
            this.stack.pop()
            this.path.pop()
        }
    }

    get current() {
        return this.stack[this.stack.length - 1]
    }

    get isArray() {
        return Array.isArray(this.current)
    }

    getResult() {
        return this.stack[0]
    }
}
