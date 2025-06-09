import * as ieee754 from "../util/ieee754"
import * as varint from "../util/varint"
import { TypeByte } from "../types"
import { Context, ReadContext } from "./context"
import { DecodeError, EncodeError } from "../errors"

const BIG_INT_ZERO = BigInt(0)
const BIG_INT_ONE = BigInt(1)
const BIG_INT_SEVEN = BigInt(7)
const BIG_INT_NEXT = BigInt(0x80)
const BIG_INT_ENDIAN = BigInt(0x7f)
const BIG_INT_FULL_ENDIAN = BigInt(0xff)
const BIG_INT_LENGTH = 19
const BIG_INT_MAX = 2 ** 128
const UINT_LENGTH_MAX = 11

/**
 * The threshold at which encoding using Fraction Encoding becomes ineffective (more than 8 bytes)
 */
const FRACTION_ENCODING_LIMIT = 2 ** (7 * 7) // 562_949_953_421_312_2

// For more efficient pow, by array is working more fast, than Math.pow()
const POW10 = Array.from({ length: 15 }, (_, i) => 10 ** i)

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
            case TypeByte.Empty:
                return
            case TypeByte.EmptyCount:
                Uint.decode.call(this)
                return
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
                    throw new EncodeError(
                        "Number outside of range " + value,
                        value
                    )

                if (!Number.isInteger(value)) {
                    Value.wrapFloat.call(this, value)
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
                    throw new EncodeError(
                        "Number outside of range of int " + value,
                        value
                    )
                this.ensure(1)
                this.write(TypeByte.Int)
                Int.encode.call(this, value)
                return
            case "bigint":
                if (value > BIG_INT_MAX || value < -BIG_INT_MAX)
                    throw new EncodeError(
                        "BigInt outside of range 128 bits, value " + value,
                        value
                    )

                this.ensure(1)
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
                if (value === null) {
                    this.ensure(1)
                    this.write(TypeByte.Null)
                } else
                    throw new EncodeError(
                        "Unexpected object when serializing simple values ",
                        null
                    )
                return
            default:
                throw new EncodeError(
                    "Unsupported data type " + typeof value + " value " + value,
                    value
                )
        }
    },
    wrapFloat(this: Context, value: number) {
        let denominator = 0
        let scaled = value < 0 ? -value : value

        this.ensure(1)

        while (scaled % 1 !== 0) {
            scaled *= 10
            denominator++
            if (denominator >= 15) {
                this.write(TypeByte.Double)
                Double.encode.call(this, value)
                return
            }
        }

        const numerator = Math.round(scaled)
        if (numerator <= FRACTION_ENCODING_LIMIT) {
            this.write(value < 0 ? TypeByte.NFloatFE : TypeByte.FloatFE)
            FloatFE.encode.call(this, numerator, denominator)
        } else {
            this.write(TypeByte.Double)
            Double.encode.call(this, value)
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
            result += (b & BIG_INT_FULL_ENDIAN) << shift
            shift += BIG_INT_SEVEN
        } while (b & BIG_INT_NEXT)

        return result
    },
    encode(this: Context, value: bigint) {
        this.ensure(BIG_INT_LENGTH)

        while (value > BIG_INT_ENDIAN) {
            this.buffer[this.offset++] = Number(value & BIG_INT_ENDIAN) | 0x80
            value >>= BIG_INT_SEVEN
            value -= BIG_INT_ONE
        }

        this.buffer[this.offset++] = Number(value) & 0x7f
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
        return numerator / POW10[denominator]
    },
    encode(this: Context, numerator: number, denominator: number) {
        Uint.encode.call(this, numerator)
        this.ensure(1)
        this.write(denominator & 0xff)
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

const textDecode = new TextDecoder("utf-8")
const textEncode = new TextEncoder()

/**
 * Encodes string. MORE FAST!
 */
const Str = {
    decode(this: Context, type: number) {
        let length = NumberType.decode.call(
            this,
            type,
            STRING_LENGTH_ADDITIONAL_MIN,
            STRING_LENGTH_ADDITIONAL_MAX
        )

        if (length <= 0) return ""

        const view = this.buffer.subarray(this.offset, this.offset + length)
        this.offset += length

        return textDecode.decode(view)
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

        const encoded = textEncode.encode(value)
        NumberType.encode.call(
            this,
            encoded.length,
            STRING_LENGTH_ADDITIONAL_MIN,
            STRING_LENGTH_ADDITIONAL_MAX
        )
        this.ensure(encoded.length)
        this.buffer.set(encoded, this.offset)
        this.offset += encoded.length
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
