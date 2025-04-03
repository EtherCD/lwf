import ieee754 from 'ieee754'
import { TypeByte } from '../types'
import { Context } from './context'

const BIG_INT_ZERO = BigInt(0)
const BIG_INT_ONE = BigInt(1)
const BIG_INT_TWO = BigInt(2)
const BIG_INT_SEVEN = BigInt(7)
const BIG_INT_NEXT = BigInt(0x80)
const BIG_INT_ENDIAN = BigInt(0x7f)
const BIG_INT_LENGTH = 19

const INT_32_MIN = -(2 ** 32 / 2)
const INT_32_MAX = 2 ** 32 / 2
const UINT_32_MAX = 2 ** 32
const INT_32_LENGTH = 5

const INT_64_MIN = Number.MIN_SAFE_INTEGER
const INT_64_MAX = Number.MAX_SAFE_INTEGER

const BIG_INT_MAX = 2 ** 128

export const Value = {
    read(this: Context) {
        switch (this.read()) {
            case TypeByte.Bool:
                return Bool.read.call(this)
            case TypeByte.VarInt32:
                return VarInt32.read.call(this)
            case TypeByte.VarInt64:
                return VarInt64.read.call(this)
            case TypeByte.UVarInt32:
                return UVarInt32.read.call(this)
            case TypeByte.UVarInt64:
                return UVarInt64.read.call(this)
            case TypeByte.VarIntBN:
                const sign = this.read()
                const val = VarIntBN.read.call(this)
                return sign ? -val : val
            case TypeByte.FloatIEEE:
                return FloatIEEE.read.call(this)
            case TypeByte.FloatFE:
                return FloatFE.read.call(this)
            case TypeByte.String:
                return Str.read.call(this)
            default:
                throw new Error('TODO: Place error here')
        }
    },
    write(this: Context, value: unknown) {
        switch (typeof value) {
            case 'boolean':
                this.write(TypeByte.Bool)
                Bool.write.call(this, value)
                return
            case 'number':
                if (value > INT_64_MAX || value < INT_64_MIN)
                    throw new Error('TODO: Place error here')

                if (!Number.isInteger(value)) {
                    this.write(TypeByte.FloatIEEE)
                    FloatIEEE.write.call(this, value)
                    return
                }

                if (value >= 0) {
                    if (value < UINT_32_MAX) {
                        this.write(TypeByte.UVarInt32)
                        UVarInt32.write.call(this, value)
                    } else {
                        this.write(TypeByte.UVarInt64)
                        UVarInt64.write.call(this, value)
                    }
                    return
                }

                if (value > INT_32_MIN && value < INT_32_MAX) {
                    this.write(TypeByte.VarInt32)
                    VarInt32.write.call(this, value)
                    return
                } else {
                    this.write(TypeByte.VarInt64)
                    VarInt64.write.call(this, value)
                }
                return
            case 'bigint':
                if (value > BIG_INT_MAX || value < -BIG_INT_MAX)
                    throw new Error('TODO: Place error here')

                this.write(TypeByte.VarIntBN)
                this.write(value < 0 ? 1 : 0)
                VarIntBN.write.call(
                    this,
                    value < 0 ? -BigInt(value) : BigInt(value)
                )
                return
            case 'string':
                this.write(TypeByte.String)
                Str.write.call(this, value)
                return
            case 'object':
                if (value === null) this.write(TypeByte.Null)
                else throw new Error('TODO: Place error here')
                return
            default:
                console.log(value)
                throw new Error('TODO: Place error here')
        }
    },
}

/**
 * Encoding Int to VarInt
 *
 * Limitations: signed Int32
 */
const VarInt32 = {
    read(this: Context) {
        return zigzag.decode(UVarInt32.read.call(this))
    },
    write(this: Context, value: number) {
        UVarInt32.write.call(this, zigzag.encode(value))
    },
}

/**
 * Encoding Int to VarInt
 *
 * Limitations: unsigned Int32
 */
export const UVarInt32 = {
    read(this: Context) {
        let result = 0,
            shift = 0,
            b

        do {
            b = this.buffer[this.offset++]
            result += (b & 0x7f) << shift
            shift += 7
        } while (b >= 0x80)

        return result >>> 0
    },
    write(this: Context, value: number) {
        this.ensure(INT_32_LENGTH)

        while (value > 0x7f) {
            this.buffer[this.offset++] = (value & 0x7f) | 0x80
            value >>>= 7
        }

        this.buffer[this.offset++] = value
    },
}

/**
 * Encoding Int64 to VarInt
 *
 * Limitations: signed Int64
 */
const VarInt64 = {
    read(this: Context) {
        return Number(zigzagBN.decode(VarIntBN.read.call(this)))
    },
    write(this: Context, value: number) {
        VarIntBN.write.call(this, zigzagBN.encode(BigInt(value)))
    },
}

/**
 * Encoding Int64 to VarInt
 * Limitations: unsigned Int64
 */
const UVarInt64 = {
    read(this: Context) {
        return Number(VarIntBN.read.call(this))
    },
    write(this: Context, value: number) {
        VarIntBN.write.call(this, BigInt(value))
    },
}

/**
 * Encoding BigInt in VarInt format
 *
 * Limitations: unsigned 128bit
 *
 * Sign stores at start of VarInt.
 */
const VarIntBN = {
    read(this: Context) {
        let result = BIG_INT_ZERO,
            shift = BIG_INT_ZERO,
            b

        do {
            b = BigInt(this.buffer[this.offset++])
            result += (b & BIG_INT_ENDIAN) << shift
            shift += BIG_INT_SEVEN
        } while (b & BIG_INT_NEXT)

        return result
    },
    write(this: Context, value: bigint) {
        this.ensure(BIG_INT_LENGTH)

        while (value > BIG_INT_ENDIAN) {
            this.buffer[this.offset++] = Number(value & BIG_INT_ENDIAN) | 0x80
            value >>= BIG_INT_SEVEN
        }

        this.buffer[this.offset++] = Number(value)
    },
}

/**
 * Fraction Encoding for float
 * Limitations: The total length of numbers must not exceed 17 digits.
 */
const FloatFE = {
    read(this: Context) {
        const numerator = UVarInt64.read.call(this)
        const denominator = this.buffer[this.offset++]
        return numerator / 10 ** denominator
    },
    write(this: Context, value: number) {
        const integer = Math.floor(value)
        let fraction = value - integer

        let low = 0
        let high = 15
        let decimals = 0

        while (low <= high) {
            const mid = Math.floor((low + high) / 2)
            const scaled = value * 10 ** mid
            if (scaled % 1 === 0) {
                decimals = mid
                high = mid - 1
            } else {
                low = mid + 1
            }
        }

        const denominator = 10 ** decimals

        const numerator =
            integer * denominator + Math.floor(fraction * denominator)

        UVarInt64.write.call(this, numerator)
        this.buffer[this.offset++] = decimals & 0xff
    },
}

/**
 * IEEE754 Encoding
 */
const FloatIEEE = {
    read(this: Context) {
        const result = ieee754.read(this.buffer, this.offset, false, 54, 8)
        this.offset += 8
        return result
    },
    write(this: Context, value: number) {
        ieee754.write(this.buffer, value, this.offset, false, 54, 8)
        this.offset += 8
    },
}

const Bool = {
    read(this: Context) {
        return this.buffer[this.offset++] ? true : false
    },
    write(this: Context, value: boolean) {
        this.buffer[this.offset++] |= value ? 0x01 : 0x00
    },
}

/**
 * Encodes string
 */
// Realization of fast encoding and decoding for string taken from protobuf.js.
// https://github.com/protobufjs/protobuf.js/blob/master/lib/utf8/index.js
const Str = {
    read(this: Context) {
        let length = UVarInt32.read.call(this)
        if (length <= 0) return ''

        const end = this.offset + length

        var str = ''
        for (; this.offset < end; ) {
            var t = this.read()
            if (t <= 0x7f) {
                str += String.fromCharCode(t)
            } else if (t >= 0xc0 && t < 0xe0) {
                str += String.fromCharCode(
                    ((t & 0x1f) << 6) | (this.read() & 0x3f)
                )
            } else if (t >= 0xe0 && t < 0xf0) {
                str += String.fromCharCode(
                    ((t & 0xf) << 12) |
                        ((this.read() & 0x3f) << 6) |
                        (this.read() & 0x3f)
                )
            } else if (t >= 0xf0) {
                var t2 =
                    (((t & 7) << 18) |
                        ((this.read() & 0x3f) << 12) |
                        ((this.read() & 0x3f) << 6) |
                        (this.read() & 0x3f)) -
                    0x10000
                str += String.fromCharCode(0xd800 + (t2 >> 10))
                str += String.fromCharCode(0xdc00 + (t2 & 0x3ff))
            }
        }

        return str
    },
    write(this: Context, value: string) {
        if (value.length === 0) {
            this.ensure(1)
            this.buffer[this.offset++] = 0x00
            return
        }

        const len = Str._len(value)

        UVarInt32.write.call(this, len)
        this.ensure(len)

        var c1, // character 1
            c2 // character 2
        for (var i = 0; i < value.length; ++i) {
            c1 = value.charCodeAt(i)
            if (c1 < 128) {
                this.write(c1)
            } else if (c1 < 2048) {
                this.write((c1 >> 6) | 192)
                this.write((c1 & 63) | 128)
            } else if (
                (c1 & 0xfc00) === 0xd800 &&
                ((c2 = value.charCodeAt(i + 1)) & 0xfc00) === 0xdc00
            ) {
                c1 = 0x10000 + ((c1 & 0x03ff) << 10) + (c2 & 0x03ff)
                ++i
                this.write((c1 >> 18) | 240)
                this.write(((c1 >> 12) & 63) | 128)
                this.write(((c1 >> 6) & 63) | 128)
                this.write((c1 & 63) | 128)
            } else {
                this.write((c1 >> 12) | 224)
                this.write(((c1 >> 6) & 63) | 128)
                this.write((c1 & 63) | 128)
            }
        }
    },
    _len(string: string) {
        var len = 0,
            c = 0
        for (var i = 0; i < string.length; ++i) {
            c = string.charCodeAt(i)
            if (c < 128) len += 1
            else if (c < 2048) len += 2
            else if (
                (c & 0xfc00) === 0xd800 &&
                (string.charCodeAt(i + 1) & 0xfc00) === 0xdc00
            ) {
                ++i
                len += 4
            } else len += 3
        }
        return len
    },
}

export const Empty = {
    write(this: Context, count: number) {
        if (count === 1) this.write(TypeByte.Empty)
        else {
            this.write(TypeByte.EmptyCount)
            UVarInt32.write.call(this, count)
        }
    },
    read(this: Context) {
        const header = this.read()
        switch (header) {
            case TypeByte.Empty:
                return 1
            case TypeByte.EmptyCount:
                return UVarInt32.read.call(this)
            default:
                throw new Error('TODO: ADD ERROROROROR')
        }
    },
    check(this: Context) {
        const header = this.buffer[this.offset]
        return header === TypeByte.Empty || header === TypeByte.EmptyCount
    },
}

const zigzag = {
    encode(val: number) {
        return val < 0 ? -val * 2 - 1 : val * 2
    },
    decode(val: number) {
        return val % 2 === 1 ? -(val + 1) / 2 : val / 2
    },
}

const zigzagBN = {
    encode(val: bigint) {
        return val < 0
            ? (-val << BIG_INT_ONE) - BIG_INT_ONE
            : val << BIG_INT_ONE
    },
    decode(val: bigint) {
        return val % BIG_INT_TWO === BIG_INT_ONE
            ? -(val + BIG_INT_ONE) / BIG_INT_TWO
            : val / BIG_INT_TWO
    },
}
