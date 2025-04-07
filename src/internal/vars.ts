import ieee754 from "ieee754"
import * as varint from "../util/varint"
import { TypeByte } from "../types"
import { Context, ReadContext } from "./context"
import { DeserializationError, SerializationError } from "../errors"

const BIG_INT_ZERO = BigInt(0)
const BIG_INT_SEVEN = BigInt(7)
const BIG_INT_NEXT = BigInt(0x80)
const BIG_INT_ENDIAN = BigInt(0x7f)
const BIG_INT_LENGTH = 19

// For writing UVarInt32 in single type byte
const UINT_64_ADDITIONAL_MIN = 0x10
const UINT_64_ADDITIONAL_MAX = 0x87
// For writing length of string in single type byte
const STRING_LENGTH_ADDITIONAL_MIN = 0x88
const STRING_LENGTH_ADDITIONAL_MAX = 0xff

//7

const BIG_INT_MAX = 2 ** 128

export const Value = {
    read(this: Context) {
        const type = this.read()

        switch (type) {
            case TypeByte.True:
                return true
            case TypeByte.False:
                return false
            case TypeByte.Int:
                return Int.read.call(this)
            case TypeByte.Int128:
                return Int128.read.call(this)
            case TypeByte.NInt128:
                return -Int128.read.call(this)
            case TypeByte.Float:
                return Float.read.call(this)
            case TypeByte.Double:
                return Double.read.call(this)
            case TypeByte.FloatFE:
                return FloatFE.read.call(this)
            case TypeByte.NFloatFE:
                return -FloatFE.read.call(this)
            default:
                if (
                    NumberType.inRange(
                        type,
                        UINT_64_ADDITIONAL_MIN,
                        UINT_64_ADDITIONAL_MAX
                    )
                ) {
                    return NumberType.read.call(
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
                    return Str.read.call(this, type)
                throw new DeserializationError(
                    "Unsupported data type " + type.toString(16)
                )
        }
    },
    write(this: Context, value: unknown) {
        switch (typeof value) {
            case "boolean":
                this.write(value ? TypeByte.True : TypeByte.False)
                return
            case "number":
                if (
                    value > Number.MAX_SAFE_INTEGER ||
                    value < Number.MIN_SAFE_INTEGER / 2
                )
                    throw new SerializationError(
                        "Number outside of range " + value
                    )

                if (!Number.isInteger(value)) {
                    if (FloatFE.test(value)) {
                        this.write(
                            value < 0 ? TypeByte.NFloatFE : TypeByte.FloatFE
                        )
                        FloatFE.write.call(this, value < 0 ? -value : value)
                    } else {
                        this.write(TypeByte.Double)
                        Double.write.call(this, value)
                    }
                    return
                }

                if (value >= 0) {
                    NumberType.write.call(
                        this,
                        value,
                        UINT_64_ADDITIONAL_MIN,
                        UINT_64_ADDITIONAL_MAX
                    )
                    return
                }

                this.write(TypeByte.Int)
                Int.write.call(this, value)
                return
            case "bigint":
                if (value > BIG_INT_MAX || value < -BIG_INT_MAX)
                    throw new SerializationError(
                        "BigInt outside of range 128 bits, value " + value
                    )

                this.write(value < 0 ? TypeByte.NInt128 : TypeByte.Int128)
                Int128.write.call(
                    this,
                    value < 0 ? -BigInt(value) : BigInt(value)
                )
                return
            case "string":
                Str.write.call(this, value)
                return
            case "object":
                if (value === null) this.write(TypeByte.Null)
                else
                    throw new SerializationError(
                        "Unexpected object when serializing simple values "
                    )
                return
            default:
                throw new SerializationError(
                    "Unsupported data type " + typeof value + " value " + value
                )
        }
    }
}

/**
 * LEB128 int limited to Number
 */
const Int = {
    read(this: Context) {
        return zigzag.decode(Uint.read.call(this))
    },
    write(this: Context, value: number) {
        Uint.write.call(this, zigzag.encode(value))
    }
}

/**
 * LEB128 int limited to Number
 */
export const Uint = {
    read(this: Context) {
        const [value, read] = varint.decode(this.buffer, this.offset)
        this.offset += read
        return value
    },
    write(this: Context, value: number) {
        this.ensure(11)
        this.offset += varint.encode(value, this.buffer, this.offset)
    },
    peek(this: Context) {
        return varint.decode(this.buffer, this.offset)[0]
    }
}

/**
 * Combines type with number.
 */
const NumberType = {
    read(this: ReadContext, type: number, min: number, max: number) {
        const range = max - min
        if (type >= min && type < max) {
            return type - min
        } else if (type === max) {
            return Uint.read.call(this) + range
        }
    },
    write(this: ReadContext, value: number, min: number, max: number) {
        const range = max - min
        if (value < range) {
            this.write(value + min)
        } else {
            this.write(max)
            Uint.write.call(this, value - range)
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
 *
 * Sign stores at start of VarInt.
 */
const Int128 = {
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
    }
}

/**
 * Fraction Encoding for float
 * Limitations: The total length of numbers must not exceed 17 digits.
 */
const FloatFE = {
    read(this: Context) {
        const numerator = Uint.read.call(this)
        const denominator = this.buffer[this.offset++]
        return numerator / 10 ** denominator
    },
    write(this: Context, value: number) {
        let denominator = 0
        let scaled = value

        // Максимум 15 знаков после запятой
        while (denominator < 15 && scaled % 1 !== 0) {
            scaled *= 10
            denominator++
        }

        const numerator = Math.round(scaled)

        if (numerator > Number.MAX_SAFE_INTEGER) {
            throw new SerializationError(
                "FloatFE outside of safe integer " + value
            )
        }

        Uint.write.call(this, numerator)
        this.buffer[this.offset++] = denominator & 0xff
    },
    test(value: number): boolean {
        let denominator = 0
        let scaled = value

        while (denominator < 15 && scaled % 1 !== 0) {
            scaled *= 10
            denominator++
        }

        const numerator = Math.round(scaled)
        return Number.isSafeInteger(numerator)
    }
}

/**
 * IEEE754 Encoding of float
 */
const Float = {
    read(this: Context) {
        const result = ieee754.read(this.buffer, this.offset, false, 21, 4)
        this.offset += 8
        return result
    },
    write(this: Context, value: number) {
        ieee754.write(this.buffer, value, this.offset, false, 21, 4)
        this.offset += 8
    }
}

/**
 * IEEE754 Encoding of double
 */
const Double = {
    read(this: Context) {
        const result = ieee754.read(this.buffer, this.offset, false, 54, 8)
        this.offset += 8
        return result
    },
    write(this: Context, value: number) {
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
    read(this: Context, type: number) {
        let length = NumberType.read.call(
            this,
            type,
            STRING_LENGTH_ADDITIONAL_MIN,
            STRING_LENGTH_ADDITIONAL_MAX
        )

        if (length <= 0) return ""

        const end = this.offset + length

        console.log(length, type.toString(16))

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
    write(this: Context, value: string) {
        if (value.length === 0) {
            this.ensure(1)
            this.buffer[this.offset++] = 0x00
            return
        }

        const len = Str._len(value)

        NumberType.write.call(
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
    write(this: Context, count: number) {
        if (count === 1) this.write(TypeByte.Empty)
        else {
            this.write(TypeByte.EmptyCount)
            Uint.write.call(this, count)
        }
    },
    read(this: Context) {
        const header = this.read()
        switch (header) {
            case TypeByte.Empty:
                return 1
            case TypeByte.EmptyCount:
                return Uint.read.call(this)
            default:
                throw new DeserializationError(
                    "An unexpected type when reading emptiness, type " + header
                )
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
