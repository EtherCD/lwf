# Specification

The current version of the specification is v1.1

Old specifications, and the version of the library implementing it are here:

[Lib](https://github.com/EtherCD/lwf/tree/v2.0)

[Specs](https://github.com/EtherCD/lwf/blob/v2.0/docs/Specification.md)

## Pseudo-syntax

Pseudo syntax is intended to simply read the bytes that will be written.

Syntax:

1. `|` - Byte separator
1. `[ ]` - Repeating block
1. `#` - Comments
1. `...` - Subsequent data of any length

Keywords:

1. `index` - Specifies an index written via varint32
1. `tb` - The byte that indicates the type of data that follows it

The following pseudo syntax entry will be an example. It is read as, the index heading byte, and repeated N times, the value data type heading block - value

```lwfp
| index [| tb | value |]
```

## Data Types

Format uses type byte. The type byte is a byte that explicitly indicates the data type itself after

Example in pseudo-syntax

```lwfp
| tb | ...value |
```

### Integer

The format uses the LEB128 (Little Endian Base 128) number encoding method, but with a modification in the form of a compact VarInt. The essence of the modification is that the byte will begin with the value of the previous byte, which allows you to expand the boundaries of the number. In two bytes with this modification, you can write **16,511** values, versus **16,383**

To record signed numbers, zigzag encoding is used, it consistently holds the negative value first, the positive value second. Example of values ​​in ascending order: 0, -1, 1, -2, 2.

To compactly record numbers greater than 64 bits, the type byte indicates whether it is a positive number or a negative number.

| TypeByte | Type     | Bit depth                 |
| -------- | -------- | ------------------------- |
| 00       | Int      | signed 64bits             |
| 01       | Uint128  | positive unsigned 128bits |
| 02       | NUint128 | negative unsigned 128bits |
| 10> 87<  | Uint     | unsigned 64bits           |

Unsigned 64-bit numbers are written in a more compact way. The number is written in TypeByte, for this purpose there are intervals in the entire typing, the interval for this number is **10** - **87** in hexdecimal. The maximum value that can be written is 119 or **87** in the typing, and this very value indicates that after there will be an expanding varint

Example of encoding UInt

```lwfb
0x10 # 0
0x86 # 118
0x87 0x00 # 119
0x87 0x01 # 120
```

### Float and Double

The format contains 4 types responsible for fractional numbers, two of which are **float** and **double**, or 32-bit and 64-bit. The other two are fractions written according to the principle of transformation into a rational fraction. These types are present for a more compact recording of fractions, if possible. The limit at which such a number becomes ineffective is `2 ** (7 * 7)` or `5629499534213122`. Inefficient recording is considered to be the total length of the numbers being written, for float and dobule this is 4 and 8 bytes respectively. For Fraction Encoding this is less than or equal to 8 bytes.

| TypeByte | Type     | Description                         | Pseudo-syntax                                               |
| -------- | -------- | ----------------------------------- | ----------------------------------------------------------- |
| 03       | Float    | Float (IEEE754 4 bit) or 32bit      | \| tb \| 4 bytes \|                                         |
| 04       | Double   | Double (IEEE754 8 bit) or 64bit     | \| tb \| 8 bytes \|                                         |
| 05       | FloatFE  | Positive fraction Encoding of float | \| tb \| numerator in varint \| denominator is pow of 10 \| |
| 06       | NFloatFE | Negative fraction Encoding of float | \| tb \| numerator in varint \| denominator is pow of 10 \| |

Example of a FloatFE entry: 127.123 = `| 05 | 127123 | 3 |`

### Booleans and Strings, Null

Strings are encoded in utf-8 format, their length is written as a UInt number, only with an interval starting from `0x88` and ending with `0xFF`. The principle of operation is the same, 0x88 is the beginning of the interval and is interpreted as 0, 0xFF is the end and equals 119, and at the same time indicates that there should be a varint next, for the expansion of the value.

Next are simple data types

| TypeByte | Type         |
| -------- | ------------ |
| 07       | bool - false |
| 08       | bool - true  |
| 09       | null         |

### Empty

Data types responsible for skipping them.

| TypeByte | Type        | Description             | Pseudo-syntax                  |
| -------- | ----------- | ----------------------- | ------------------------------ |
| 0e       | empty       | Single empty field      | \| tb \|                       |
| 0f       | empty count | Empty for number values | \| tb \| count in uvarint32 \| |

Used to indicate gaps in a chunk, since a chunk encodes the values ​​of only those fields that are specified in the scheme, missing values ​​must be replaced with gaps. Otherwise, reading that relies on the length of fields in the scheme will stop reading correctly.

## Schema

First of all, the format itself relies on a schema, which always specifies: whether the block is an element of an array, whether the block is an element of an Array-like Map, the key by which the object will be added to the related object, the names of the fields by which the values ​​will be written to the object

Summary fields in the schema:

| Field   | Description                                                    |
| ------- | -------------------------------------------------------------- |
| index   | uvarint32 number indicating the scheme                         |
| key     | The key by which the chunk will be written                     |
| fields  | fields by which values ​​will be written to the object         |
| isArray | Designation that this is an array                              |
| isMap   | Indication that this is an array-like object                   |
| nested  | list of indexes that the current schema includes within itself |

The schema describes an object or array, the fields that will be used to simplify the recording, by recording only the values. The main system by which nesting is described is the nested field, indicating the nested schema.

In order for nested objects to be written correctly, the nested schema must have a `key` field, which will indicate by which key the object should be written.

Examples of diagrams and the objects they describe

```json
{
    "a": true,
    "b": [{ "c": true, "d": "ready!" }]
}
```

```json
[
    { "fields": ["a"], "nested": [1] },
    { "fields": ["c", "d"], "key": "b", "isArray": true }
]
```

An array-like object is a data structure that behaves like an array: it has ordered keys, but it is not a full-fledged array.

Example array-like object:

```json
{
    "1": { "object": true },
    "2": { "object": true }
}
```

```json
[{ "isMap": true, "fields": ["object"] }]
```

## Chunks

The main data structure of the format, it looks like this in pseudo syntax, to represent an object with fields

```lwfp
| index [| tb | value |]
```

The principle of writing chunks is based on the fact that nested objects are broken down one by one and written in order. Example of writing chunks into chunks, nested structure

```json
{
    "foo": "bar",
    "a": { "b": 127, "c": { "d": "ready!" } },
    "e": { "f": true }
}
```

```
[ general object ] [ a object ] [ c object ] [ e object ]
```

### Arrays

Writing arrays in pseudocode looks like this:

```lwfp
| index | length in uvarint32 [| tb | value |]
```

The length field is intended to indicate that subsequent values ​​should not be processed by the scheme, and will be added to the array as is. This field is 0 when encoding an object, and the length of all values ​​when encoding values

Example of array encoding:

```json
[127, 20, { "foo": "bar" }, 128]
```

```lwfp
| index | length = 2 | tb uint32 | 127 | tb uint32 | 20 |
| index | length = 0 | tb string | bar |
| index | length = 1 | tb uint32 | 128 |
```

### Array-like objects

Writing arrays-like objects in pseudocode looks like this:

```lwfp
| index | length uint32 | tb of key | key [| tb | value |]
# for length <0
| index | length uint32 [| tb of key | key | tb | value |]
```

Here the key is the field by which the object or value will be written, an example in pseudocode of object encoding

```json
{ "1": 127, "2": 20, "3": { "foo": "bar" }, "4": 128 }
```

```lwfp
| index | length = 2 | tb string | "1" | tb uint32 | 127 | tb string | "2" | tb uint32 | 20 |
| index | length = 0 | tb string | "3" | tb string | "bar" |
| index | length = 1 | tb string | "4" | tb uint32 | 128 |
```

That's all the specification at the moment.
