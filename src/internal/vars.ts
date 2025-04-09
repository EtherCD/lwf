import ieee754 from "ieee754"
import * as varint from "../util/varint"
import { TypeByte } from "../types"
import { Context, ReadContext } from "./context"
import { DecodeError, EncodeError } from "../errors"

const BIG_INT_ZERO = BigInt(0)
const BIG_INT_SEVEN = BigInt(7)
const BIG_INT_NEXT = BigInt(0x80)
const BIG_INT_ENDIAN = BigInt(0x7f)
const BIG_INT_LENGTH = 19
const BIG_INT_MAX = 2 ** 128
const UINT_LENGTH_MAX = 11

/**
 * The threshold at which encoding using Fraction Encoding becomes ineffective (more than 8 bytes)
 */
const FRACTION_ENCODING_LIMIT = 2 ** (7 * 7) // 562_949_953_421_312_2

// Range in byte type in which additional values ​​can be encoded
const UINT_64_ADDITIONAL_MIN = 0x10
const UINT_64_ADDITIONAL_MAX = 0x87
const STRING_LENGTH_ADDITIONAL_MIN = 0x88
const STRING_LENGTH_ADDITIONAL_MAX = 0xff

export const Value = {
    /**
     * Decode value from buffer
     * @param this Context
     * @returns simple value (not Object or Array)
     */
    decode(this: Context) {
        const type = this.read()

        switch (type) {
            case TypeByte.True:
                return true
            case TypeByte.False:
                return false
            case TypeByte.Int:
                return Int.decode.call(this)
            case TypeByte.Uint128:
                return Uint128.decode.call(this)
            case TypeByte.NUint128:
                return -Uint128.decode.call(this)
            case TypeByte.Float:
                return Float.decode.call(this)
            case TypeByte.Double:
                return Double.decode.call(this)
            case TypeByte.FloatFE:
                return FloatFE.decode.call(this)
            case TypeByte.NFloatFE:
                return -FloatFE.decode.call(this)
            default:
                if (
                    NumberType.inRange(
                        type,
                        UINT_64_ADDITIONAL_MIN,
                        UINT_64_ADDITIONAL_MAX
                    )
                ) {
                    return NumberType.decode.call(
                        this,
                        type,
                        UINT_64_ADDITIONAL_MIN,
                        UINT_64_ADDITIONAL_MAX
                    )
                }
                if (
                    NumberType.inRange(
                        type,
                        STRING_LENGTH_ADDITIONAL_MIN,
                        STRING_LENGTH_ADDITIONAL_MAX
                    )
                )
                    return Str.decode.call(this, type)
                let a = ""
                this.buffer
                    .slice(this.offset - 10, this.offset + 9)
                    .forEach((v) => {
                        a += v.toString(16) + " "
                    })
                throw new DecodeError(
                    "Unsupported data type " + type.toString(16)
                )
        }
    },
    /**
     * Encodes value
     * @param this context
     * @param value simple value (not Object or Array)
     */
    encode(this: Context, value: unknown) {
        switch (typeof value) {
            case "boolean":
                this.ensure(1)
                this.write(value ? TypeByte.True : TypeByte.False)
                return
            case "number":
                if (
                    value > Number.MAX_SAFE_INTEGER ||
                    value < Number.MIN_SAFE_INTEGER
                )
                    throw new EncodeError("Number outside of range " + value)

                if (!Number.isInteger(value)) {
                    const positiveVal = Math.abs(value)
                    const range = FloatFE.getRange(positiveVal)
                    const numerator = Math.floor(range)
                    const denominator = Math.floor((range % 1) * 10)
                    this.ensure(1)
                    if (
                        numerator !== -1 &&
                        numerator <= FRACTION_ENCODING_LIMIT
                    ) {
                        this.write(
                            value < 0 ? TypeByte.NFloatFE : TypeByte.FloatFE
                        )
                        FloatFE.encode.call(
                            this,
                            positiveVal,
                            numerator,
                            denominator
                        )
                    } else {
                        this.write(TypeByte.Double)
                        Double.encode.call(this, value)
                    }
                    return
                }

                if (value >= 0) {
                    NumberType.encode.call(
                        this,
                        value,
                        UINT_64_ADDITIONAL_MIN,
                        UINT_64_ADDITIONAL_MAX
                    )
                    return
                }

                if (value < Number.MIN_SAFE_INTEGER / 2)
                    throw new EncodeError("Number outside of range " + value)
                this.ensure(1)
                this.write(TypeByte.Int)
                Int.encode.call(this, value)
                return
            case "bigint":
                if (value > BIG_INT_MAX || value < -BIG_INT_MAX)
                    throw new EncodeError(
                        "BigInt outside of range 128 bits, value " + value
                    )

                this.write(value < 0 ? TypeByte.NUint128 : TypeByte.Uint128)
                Uint128.encode.call(
                    this,
                    value < 0 ? -BigInt(value) : BigInt(value)
                )
                return
            case "string":
                Str.encode.call(this, value)
                return
            case "object":
                if (value === null) this.write(TypeByte.Null)
                else
                    throw new EncodeError(
                        "Unexpected object when serializing simple values "
                    )
                return
            default:
                throw new EncodeError(
                    "Unsupported data type " + typeof value + " value " + value
                )
        }
    }
}

/**
 * varint int limited to Number
 */
const Int = {
    decode(this: Context) {
        return zigzag.decode(Uint.decode.call(this))
    },
    encode(this: Context, value: number) {
        Uint.encode.call(this, zigzag.encode(value))
    }
}

/**
 * varint int limited to Number
 */
export const Uint = {
    decode(this: Context) {
        const [value, read] = varint.decode(this.buffer, this.offset)
        this.offset += read
        return value
    },
    encode(this: Context, value: number) {
        this.ensure(UINT_LENGTH_MAX)
        this.offset += varint.encode(value, this.buffer, this.offset)
    },
    peek(this: Context) {
        return varint.decode(this.buffer, this.offset)[0]
    }
}

/**
 * Combines type with number.
 */
export const NumberType = {
    decode(this: ReadContext, type: number, min: number, max: number) {
        const range = max - min
        if (type >= min && type < max) {
            return type - min
        } else if (type === max) {
            return Uint.decode.call(this) + range
        }
    },
    encode(this: ReadContext, value: number, min: number, max: number) {
        const range = max - min
        this.ensure(1)
        if (value < range) {
            this.write(value + min)
        } else {
            this.write(max)
            Uint.encode.call(this, value - range)
        }
    },
    inRange(value: number, min: number, max: number) {
        return value >= min && value <= max
    }
}

/**
 * Encoding BigInt in VarInt format
 *
 * Limitations: unsigned 128bit
 */
const Uint128 = {
    decode(this: Context) {
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
    encode(this: Context, value: bigint) {
        this.ensure(BIG_INT_LENGTH)

        while (value > BIG_INT_ENDIAN) {
            this.buffer[this.offset++] = Number(value & BIG_INT_ENDIAN) | 0x80
            value >>= BIG_INT_SEVEN
        }

        this.buffer[this.offset++] = Number(value)
    }
}

/**
 * More compact than double, uses if double encoding too long in bytes
 *
 * Effective coding is only possible if number <= 562_949_953_421_312_2
 *
 * Then it takes a smaller or identical form with double the size.
 */
const FloatFE = {
    decode(this: Context) {
        const numerator = Uint.decode.call(this)
        const denominator = this.buffer[this.offset++]
        return numerator / 10 ** denominator
    },
    encode(
        this: Context,
        value: number,
        numerator: number,
        denominator: number
    ) {
        Uint.encode.call(this, numerator)
        this.ensure(1)
        this.buffer[this.offset++] = denominator & 0xff
    },
    getRange(value: number): number {
        let denominator = 0
        let scaled = value < 0 ? -value : value

        while (denominator < 15 && scaled % 1 !== 0) {
            scaled *= 10
            denominator++
        }

        const numerator = Math.round(scaled)
        return denominator === 14 ? -1 : numerator + denominator / 10
    }
}

/**
 * IEEE754 Encoding of float
 */
export const Float = {
    decode(this: Context) {
        const result = ieee754.read(this.buffer, this.offset, false, 23, 4)
        this.offset += 4
        return result
    },
    encode(this: Context, value: number) {
        this.ensure(4)
        ieee754.write(this.buffer, value, this.offset, false, 23, 4)
        this.offset += 4
    }
}

/**
 * IEEE754 Encoding of double
 */
const Double = {
    decode(this: Context) {
        const result = ieee754.read(this.buffer, this.offset, false, 54, 8)
        this.offset += 8
        return result
    },
    encode(this: Context, value: number) {
        this.ensure(8)
        ieee754.write(this.buffer, value, this.offset, false, 54, 8)
        this.offset += 8
    }
}

/**
 * Encodes string
 */
// Realization of fast encoding and decoding for string taken from protobuf.js.
// https://github.com/protobufjs/protobuf.js/blob/master/lib/utf8/index.js
const Str = {
    decode(this: Context, type: number) {
        let length = NumberType.decode.call(
            this,
            type,
            STRING_LENGTH_ADDITIONAL_MIN,
            STRING_LENGTH_ADDITIONAL_MAX
        )

        if (length <= 0) return ""

        const end = this.offset + length

        var str = ""
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
    encode(this: Context, value: string) {
        if (value.length === 0) {
            NumberType.encode.call(
                this,
                0,
                STRING_LENGTH_ADDITIONAL_MIN,
                STRING_LENGTH_ADDITIONAL_MAX
            )
            return
        }

        const len = Str._len(value)

        NumberType.encode.call(
            this,
            len,
            STRING_LENGTH_ADDITIONAL_MIN,
            STRING_LENGTH_ADDITIONAL_MAX
        )
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
    }
}

export const Empty = {
    decode(this: Context) {
        const header = this.read()
        switch (header) {
            case TypeByte.Empty:
                return 1
            case TypeByte.EmptyCount:
                return Uint.decode.call(this)
            default:
                throw new DecodeError(
                    "An unexpected type when reading emptiness, type " + header
                )
        }
    },
    encode(this: Context, count: number) {
        this.ensure(1)
        if (count === 1) this.write(TypeByte.Empty)
        else {
            this.write(TypeByte.EmptyCount)
            Uint.encode.call(this, count)
        }
    },
    check(this: Context) {
        const header = this.buffer[this.offset]
        return header === TypeByte.Empty || header === TypeByte.EmptyCount
    }
}

const zigzag = {
    encode(val: number) {
        return val < 0 ? -val * 2 - 1 : val * 2
    },
    decode(val: number) {
        return val % 2 === 1 ? -(val + 1) / 2 : val / 2
    }
}
