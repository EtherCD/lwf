import { ReadStackValue, SchemaValue, WriteStackValue } from "../types"

export class WriteStack {
    array: WriteStackValue[]
    prevDepth: number = 0

    constructor(object: Object) {
        this.array = [[object, 0, undefined, undefined, 0]]
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
        overrideIndex?: number,
        isJustValues?: boolean,
        key?: string,
        nestingDepth?: number
    ) {
        this.array.push([
            object,
            overrideIndex,
            isJustValues,
            key,
            nestingDepth
        ])
    }

    pop() {
        return this.array.pop()
    }

    neighbor() {
        return this.array[this.array.length - 1]
    }
}

export class ReadStack {
    private originalObject: object
    /**
     * Stack of nested objects within each other
     */
    private stack: ReadStackValue[] = []
    /**
     * An array that stores nesting of arrays or a map when reading
     */
    private notObjectsIndexes: number[] = []

    constructor(schema: SchemaValue) {
        this.originalObject = schema.isArray ? [] : {}
        this.stack.push({ parent: null, key: null })
        this.stack.push({ parent: this.originalObject, key: null })
    }

    /**
     * Returns current element in stack
     */
    private get currentFrame() {
        return this.stack[this.stack.length - 1]
    }

    /**
     * Returns current ref to object in stack
     */
    get currentRef() {
        const { parent, key } = this.currentFrame
        return key == null ? parent : parent[key]
    }

    /**
     * Creating an object and moving to it on the stack
     */
    enterObject(key?: string) {
        const container = {}
        if (key !== undefined) {
            this.currentRef[key] = container
            this.stack.push({ parent: this.currentRef, key })
        } else if (Array.isArray(this.currentRef)) {
            this.currentRef.push(container)
            this.stack.push({
                parent: this.currentRef,
                key: this.currentRef.length - 1
            })
        }
    }

    /**
     * Creating an array and moving to it on the stack
     */
    enterArray(index: number, key?: string) {
        const container: any[] = []
        this.notObjectsIndexes.push(index)
        if (key !== undefined) {
            this.currentRef[key] = container
            this.stack.push({ parent: this.currentRef, key })
        } else if (Array.isArray(this.currentRef)) {
            this.currentRef.push(container)
            this.stack.push({
                parent: this.currentRef,
                key: this.currentRef.length - 1
            })
        }
    }

    /**
     * Creating an array-like object and moving to it on the stack
     */
    enterMap(index: number, key?: string) {
        this.notObjectsIndexes.push(index)
        this.enterObject(key)
    }

    /**
     * Exit nesting by N nesting amount
     * @param levels default 1
     */
    exit(levels: number = 1) {
        while (levels-- > 0 && this.stack.length > 2) {
            this.stack.pop()
        }
    }

    /**
     * Exit from array, or array-like object
     */
    exitNotObject() {
        this.notObjectsIndexes.pop()
        this.exit()
    }

    /**
     * Checking if the current index is the last in a list of array or array-like objects indices
     * @param index index by schema
     * @returns boolean
     */
    isEqualsIndexes(index: number) {
        return (
            this.notObjectsIndexes.length !== 0 &&
            this.notObjectsIndexes[this.notObjectsIndexes.length - 1] === index
        )
    }

    /**
     * Sets a field in the current object
     * @param key field name
     * @param value field value
     */
    setField(key: string, value: any) {
        this.currentRef[key] = value
    }

    /**
     * Pushes simple value to array.
     * @param value not Object value
     */
    pushValue(value: any) {
        if (Array.isArray(this.currentRef)) {
            this.currentRef.push(value)
        }
    }

    get result() {
        return this.originalObject
    }

    get currentKey() {
        const frame = this.stack[this.stack.length - 1]
        return frame.key
    }

    get currentParent() {
        return this.stack[this.stack.length - 1].parent
    }

    get isArray() {
        return Array.isArray(this.currentRef)
    }

    get isMap() {
        return this.currentRef instanceof Object
    }
}
