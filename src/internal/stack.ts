import { ReadStackArray, SchemaValue, WriteStackValue } from "../types"

export class WriteStack {
    array: WriteStackValue[]

    constructor(object: Object) {
        this.array = [[object, 0]]
    }

    /**
     * Add element to serialization stack
     * @param object Element
     * @param overrideIndex An index that overrides the next one in the numbering
     * @param isJustValues Designation that these are only simple values
     * @param key Key for recording isMap objects correctly
     */
    add(
        object: Object,
        overrideIndex: number = null,
        isJustValues: boolean = null,
        key: string = null
    ) {
        this.array.push([object, overrideIndex, isJustValues, key])
    }

    pop() {
        return this.array.pop()
    }
}

export class ReadStack {
    private stack: ReadStackArray = []

    constructor(schema: SchemaValue) {
        if (schema.isArray) this.enterArray(0)
    }

    get current() {
        return this.stack[this.stack.length - 1]
    }

    enterObject(index: number, key: string = null) {
        this.stack.push({
            root: {},
            key,
            index,
            isArray: false
        })
    }

    /**
     * Creating an array and moving to it on the stack
     */
    enterArray(index: number, key: string = null) {
        this.stack.push({
            root: [],
            key,
            index,
            isArray: true
        })
    }

    /**
     * Exit nesting by N nesting amount
     * @param levels default 1
     */
    exit(levels: number = 1) {
        while (levels-- > 0 && this.stack.length >= 2) {
            const obj = this.stack.pop()
            if (this.isArray) {
                ;(this.current.root as Array<unknown>).push(obj.root)
            } else {
                this.stack[this.stack.length - 1].root[obj.key] = obj.root
            }
        }
    }

    collapse() {
        this.exit(this.stack.length - 1)
    }

    /**
     * Sets a field in the current object
     * @param key field name
     * @param value field value
     */
    setField(key: string, value: any) {
        this.current.root[key] = value
    }

    /**
     * Pushes simple value to array.
     * @param value not Object value
     */
    pushValue(value: any) {
        if (this.isArray) {
            ;(this.current.root as Array<unknown>).push(value)
        }
    }

    isEqualsIndexes(index: number) {
        return this.current && this.current.index === index
    }

    get result() {
        return this.stack[0].root
    }

    get isArray() {
        return this.current && this.current.isArray
    }
}

export class StreamStack {
    index: number
}
