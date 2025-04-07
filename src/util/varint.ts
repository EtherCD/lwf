// That's great library from @atcute/varint
// Why this library only as module 😭

const MSB = 0x80
const REST = 0x7f
const MSBALL = ~REST
const INT = 2 ** 31
const N1 = 2 ** 7
const N2 = 2 ** 14
const N3 = 2 ** 21
const N4 = 2 ** 28
const N5 = 2 ** 35
const N6 = 2 ** 42
const N7 = 2 ** 49
const N8 = 2 ** 56
const N9 = 2 ** 63

/**
 * Encodes a varint
 * @param num Number to encode
 * @param buf Buffer to write on
 * @param offset Starting position on the buffer
 * @returns The amount of bytes written
 */
const encode = (num, buf, offset) => {
    if (num > Number.MAX_SAFE_INTEGER) {
        throw new RangeError("could not encode varint")
    }

    const start = offset

    while (num >= INT) {
        buf[offset++] = (num & 0xff) | MSB

        num /= 128
    }

    while (num & MSBALL) {
        buf[offset++] = (num & 0xff) | MSB

        num >>>= 7
    }

    buf[offset] = num | 0

    return offset - start + 1
}

/**
 * Decodes a varint
 * @param buf Buffer to read from
 * @param offset Starting position on the buffer
 * @returns A tuple containing the resulting number, and the amount of bytes read
 */
const decode = (buf, offset) => {
    let l = buf.length

    let res = 0

    let shift = 0

    let counter = offset

    let b

    do {
        if (counter >= l) {
            return [res, counter - offset]
        }

        b = buf[counter++]

        res +=
            shift < 28 ? (b & REST) << shift : (b & REST) * Math.pow(2, shift)

        shift += 7
    } while (b >= MSB)

    return [res, counter - offset]
}

/**
 * Returns encoding length
 * @param num The number to encode
 * @returns Amount of bytes needed for encoding
 */
const encodingLength = (num) => {
    return num < N1
        ? 1
        : num < N2
        ? 2
        : num < N3
        ? 3
        : num < N4
        ? 4
        : num < N5
        ? 5
        : num < N6
        ? 6
        : num < N7
        ? 7
        : num < N8
        ? 8
        : num < N9
        ? 9
        : 10
}

export { encode, decode, encodingLength }
