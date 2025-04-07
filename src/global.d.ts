declare module "@atcute/varint" {
    /**
     * Encodes a varint
     * @param num Number to encode
     * @param buf Buffer to write on
     * @param offset Starting position on the buffer
     * @returns The amount of bytes written
     */
    export const encode: (
        num: number,
        buf: Uint8Array | number[],
        offset?: number
    ) => number

    /**
     * Decodes a varint
     * @param buf Buffer to read from
     * @param offset Starting position on the buffer
     * @returns A tuple containing the resulting number, and the amount of bytes read
     */
    export const decode: (
        buf: Uint8Array | number[],
        offset?: number
    ) => [num: number, read: number]

    /**
     * Returns encoding length
     * @param num The number to encode
     * @returns Amount of bytes needed for encoding
     */
    export const encodingLength: (num: number) => number
}
