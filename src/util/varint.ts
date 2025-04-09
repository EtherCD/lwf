// That's great library from @atcute/varint, and modified for working with compact varint
// Why this library only as module 😭

const MSB = 0x80
const REST = 0x7f
const MSBALL = ~REST
const INT = 2 ** 31

/**
 * Encodes a compact varint
 * @param num Number to encode
 * @param buf Buffer to write on
 * @param offset Starting position on the buffer
 * @returns The amount of bytes written
 */
const encode = (x: number, buf, offset) => {
    const start = offset
    while (x >= INT) {
        buf[offset++] = (x & REST) | MSB
        x /= 128
        x -= 1
    }

    while (x & MSBALL) {
        buf[offset++] = (x & REST) | MSB
        x >>>= 7
        x -= 1
    }

    buf[offset] = x & REST
    return offset - start + 1
}

/**
 * Decodes a compact varint
 * @param buf Buffer to read from
 * @param offset Starting position on the buffer
 * @returns A tuple containing the resulting number, and the amount of bytes read
 */
const decode = (buf, offset) => {
    let x = 0
    let shift = 0
    let n = offset

    while (true) {
        const b = buf[n++]
        x += shift < 28 ? (b & 0xff) << shift : (b & 0xff) * Math.pow(2, shift)
        if ((b & MSB) === 0) {
            return [x, n - offset]
        }
        shift += 7
    }
}

export { encode, decode }
