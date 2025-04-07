# Specification

The current version of the specification is v1

## Pseudo-syntax

Pseudo syntax is intended to simply read the bytes that will be written.

Syntax:

1. `|` - Byte separator
1. `[ ]` - Repeating block
1. `#` - Comments

Keywords:

1. `index` - Specifies an index written via varint32
1. `hb` - The byte that indicates the type of data that follows it

The following pseudo syntax entry will be an example. It is read as, the index heading byte, and repeated N times, the value data type heading block - value

```lwfp
| index [| hb | value |]
```

## Data Types

### Integer

The format represents the following types of data: `VarInt32`, `UVarInt32`, `VarInt64`, `UVarInt64`, `VarIntBN`

To write numbers, the LEB128 approach is used, or Little Endian Base 128, where 8 bits indicate that the number continues, and we can read the next byte.

To record signed numbers, zigzag encoding is used, it consistently holds the negative value first, the positive value second. Example of values ​​in ascending order: 0, 1, -1, 2, -2.

For the VarIntBN data type, the sign is specified by the byte at the beginning `if byte == 0x00 then +N else -N`, since encoding it via zigzag takes too much space.

| HeadByte | Type      | Bit depth       |
| -------- | --------- | --------------- |
| 00       | VarInt32  | signed 32bits   |
| 01       | UVarInt32 | unsigned 32bits |
| 02       | VarInt64  | signed 64bits   |
| 03       | UVarInt64 | unsigned 64bits |
| 04       | VarIntBN  | 128bits         |

### Float numbers

The format presents 2 types of fraction notation. The first type converts a float number into a numerator/denominator notation. This is a more compact notation and less fast. The second type of notation uses the IEEE 754 standard, 8-bit, with 11 exponent bits and 53 bits of mantissa.

| HeadByte | Type      | Description                                               | Pseudo-syntax                                                         |
| -------- | --------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| 05       | FloatFE   | Write a floating point number as numerator/10^denominator | \| hb \| sign 00 +N 01 -N \| numerator in uvarint64 \| denominator \| |
| 06       | FloatIEEE | IEEE 754 floating point notation                          | \| hb \| value in 8bits \|                                            |

FloatFE converts the number to a 64-bit integer, and writes the denominator as a single byte as a power of 10. The limitations are that float is written with 14 common digits.

Example of a FloatFE entry: 127.123 = `| 127123 as uvarint64 | 3 |`

### Booleans and Strings, Null

Boolean values ​​are written to `07` and `17`

Strings are encoded using UTF-8, and the length of the encoded UTF-8 numbers is written at the beginning after HeadByte

| HeadByte | Type       | Pseudo-syntax                                    |
| -------- | ---------- | ------------------------------------------------ |
| 07       | bool false | \| hb \|                                         |
| 08       | bool true  | \| hb \|                                         |
| 09       | string     | \| hb \| length in uvarint32 \| utf-8 chars.. \| |
| 0a       | null       | \| hb \|                                         |

### Empty

Data types responsible for skipping them.

| HeadByte | Type        | Description             | Pseudo-syntax                  |
| -------- | ----------- | ----------------------- | ------------------------------ |
| 0b       | empty       | Single empty field      | \| hb \|                       |
| 0c       | empty count | Empty for number values | \| hb \| count in uvarint32 \| |

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
| index [| hb | value |]
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
| index | length in uvarint32 [| hb | value |]
```

The length field is intended to indicate that subsequent values ​​should not be processed by the scheme, and will be added to the array as is. This field is 0 when encoding an object, and the length of all values ​​when encoding values

Example of array encoding:

```json
[127, 20, { "foo": "bar" }, 128]
```

```lwfp
| index | length = 2 | hb uint32 | 127 | hb uint32 | 20 |
| index | length = 0 | hb string | bar |
| index | length = 1 | hb uint32 | 128 |
```

### Array-like objects

Writing arrays-like objects in pseudocode looks like this:

```lwfp
| index | length uint32 | hb of key | key [| hb | value |]
# for length <0
| index | length uint32 [| hb of key | key | hb | value |]
```

Here the key is the field by which the object or value will be written, an example in pseudocode of object encoding

```json
{ "1": 127, "2": 20, "3": { "foo": "bar" }, "4": 128 }
```

```lwfp
| index | length = 2 | hb string | "1" | hb uint32 | 127 | hb string | "2" | hb uint32 | 20 |
| index | length = 0 | hb string | "3" | hb string | "bar" |
| index | length = 1 | hb string | "4" | hb uint32 | 128 |
```

That's all the specification at the moment.
