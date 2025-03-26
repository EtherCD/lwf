var offset = 0
var buffer = new Uint8Array(100)

const MIN_INT32 = -0x80000000
const MAX_INT32 = 0x7fffffff
const MAX_UINT32 = 0xffffffff
const MIN_INT64 = -0x8000000000000000
const MAX_INT64 = 0x7ffffffffffffc00
const MAX_UINT64 = 0xfffffffffffff800

var BIT_32 = 0x100000000

const zigzagEncode = (n) => (n << 1) ^ (n >> 31)

const zigzagDecode = (n) => (n >> 1) ^ -(n & 1)

const varint32 = {
    read() {
        let result = 0,
            shift = 0,
            b

        do {
            b = buffer[offset++]
            result += (b & 0x7f) << shift
            shift += 7
        } while (b >= 0x7f)

        return result
    },
    write(value) {
        while (value > 0x7f) {
            buffer[offset++] = (value & 0x7f) | 0x80
            value >>>= 7
        }

        buffer[offset++] = value
    },
}

const uint32 = {
    read() {
        let result = 0,
            shift = 0,
            b

        do {
            b = buffer[offset++]
            result += (b & 0x7f) << shift
            shift += 7
        } while (b >= 0x7f)

        return result
    },
    write(value) {
        while (value > 0x7f) {
            buffer[offset++] = (value & 0x7f) | 0x80
            value >>>= 7
        }

        buffer[offset++] = value
    },
}

const uint64 = {
    read() {
        return Number(varIntBN.decode())
    },
    write(value) {
        varIntBN.encode(BigInt(value))
    },
}

const int64 = {
    read() {
        return zigzagDecode(Number(varIntBN.decode()))
    },
    write(value) {
        varIntBN.encode(BigInt(zigzagEncode(value)))
        console.log(zigzagEncode(value))
    },
}

/**
 * Big Int encode / decode in LEB 128
 */
const varIntBN = {
    encode(value) {
        let isNegative = value < 0n
        if (isNegative) value = -value

        buffer[offset++] |= isNegative ? 0x40 : 0

        while (value > 0x7f) {
            buffer[offset++] = Number(value & 0x7fn) | 0x80
            value >>= 7n
        }

        buffer[offset++] = Number(value)
    },

    decode() {
        let isNegative = (buffer[offset] & 0x40) !== 0
        buffer[offset++] &= 0x3f
        let result = 0n,
            shift = 0n,
            b

        do {
            b = BigInt(buffer[offset++])
            result += (b & 0x7fn) << shift
            shift += 7n
        } while (b & 0x80n)

        return isNegative ? -result : result
    },
}

const uVarIntBN = {
    write(value) {
        while (value > 0x7f) {
            buffer[offset++] = Number(value & 0x7fn) | 0x80
            value >>= 7n
        }

        buffer[offset++] = Number(value)
    },
    read() {
        let result = 0n,
            shift = 0n,
            b

        do {
            b = BigInt(buffer[offset++])
            result |= (b & 0x7fn) << shift
            shift += 7n
        } while (b & 0x80n)

        return result
    },
}

const VarIntBN = {
    write(value) {
        while (value > 0x7f) {
            buffer[offset++] = Number(value & 0x7fn) | 0x80
            value >>= 7n
        }

        buffer[offset++] = Number(value)
    },
    read() {
        let result = 0n,
            shift = 0n,
            b

        do {
            b = BigInt(buffer[offset++])
            result |= (b & 0x7fn) << shift
            shift += 7n
        } while (b & 0x80n)

        return result
    },
}

function encodeFraction(num) {
    const integer = Math.floor(num)
    let fraction = (num - integer).toFixed(10)
    fraction = parseFloat(fraction)

    let low = 0
    let high = 15
    let best = 0

    while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        const scaled = num * 10 ** mid
        if (scaled % 1 === 0) {
            best = mid
            high = mid - 1
        } else {
            low = mid + 1
        }
    }

    const coef = 10 ** best

    const numerator = integer * coef + Math.floor(fraction * coef)

    uVarIntBN.write(BigInt(numerator))
    buffer[offset++] = best & 0xff
}

function decodeFraction() {
    offset = 0
    const numerator = uVarIntBN.read()
    const denominator = 10 ** buffer[offset++]
    console.log(denominator)
    return BigInt(numerator) / BigInt(denominator)
}

// var ops = 0
// const start = Date.now()
// while (Date.now() - start < 1000) {
//     ops++

//     offset = 0
// }

// console.log(ops)

// console.log(2n ** 256n)

// uVarIntBN.write(-435n)
//
// encodeFraction()

offset = 0
const num = 9007199254740991 ** 2

console.log(num)

uint64.write(num)
console.log(buffer, offset)
offset = 0
console.log(uint64.read())

// uvarint64.write(18446744073709549567n)
// offset = 0
// console.log(buffer)

// console.log(uvarint64.read())

// console.log(decodeFraction())
