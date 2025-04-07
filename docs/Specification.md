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

Keywords:

1. `index` - Specifies an index written via varint32
1. `hb` - The byte that indicates the type of data that follows it

The following pseudo syntax entry will be an example. It is read as, the index heading byte, and repeated N times, the value data type heading block - value

```lwfp
| index [| hb | value |]
```

## Data Types

### Integer

In the format, all numbers are either uin64 or int64. For compactness of recording, LEB128 (Little Endian Base 128) encoding is used. Also in the format there is a 128-bit version of Int

To record signed numbers, zigzag encoding is used, it consistently holds the negative value first, the positive value second. Example of values ​​in ascending order: 0, -1, 1, -2, 2.

| HeadByte | Type    | Bit depth        |
| -------- | ------- | ---------------- |
| 00       | Int64   | signed 64bits    |
| 01       | Int128  | positive 128bits |
| 02       | NInt128 | negative 128bits |

Since zigzag encoding is not suitable for a 128-bit number, since it is in particular unlimited, therefore it is not worth multiplying it by 2, the record will become even more huge. There are 2 types in the format that describe the sign for this number.

Unsigned integers are represented in an even more compact notation. For this purpose, space is allocated in the type byte for these numbers, starting with **0x10** and ending with **0x87**, the last number will automatically indicate that the following bytes will be UInt, minus the number written in the byte.

Example of encoding UInt

```lwfb
0x10 # 0
0x86 # 118
0x87 0x00 # 119
0x87 0x01 # 120
```

### Float and Double

The format contains 4 types responsible for fractional numbers, two of which are **float** and **double**, or 32-bit and 64-bit. The other two are fractions written according to the principle of conversion into a rational fraction. The limitations for such a breakdown are the 64-bit number into which the fraction will turn.

| HeadByte | Type     | Description                         | Pseudo-syntax                                               |
| -------- | -------- | ----------------------------------- | ----------------------------------------------------------- |
| 03       | Float    | Float (IEEE754 4 bit) or 32bit      | \| hb \| 4 bytes \|                                         |
| 04       | Double   | Double (IEEE754 8 bit) or 64bit     | \| hb \| 8 bytes \|                                         |
| 05       | FloatFE  | Positive fraction Encoding of float | \| hb \| numerator in varint \| denominator is pow of 10 \| |
| 06       | NFloatFE | Negative fraction Encoding of float | \| hb \| numerator in varint \| denominator is pow of 10 \| |

Example of a FloatFE entry: 127.123 = `| 05 | 127123 | 3 |`

### Booleans and Strings, Null

Strings are encoded in utf-8 format, their length is written according to the Uint principle, as well as the allocated bytes in the type byte, starting with `0x88` and ending with `0xFF`. These bytes are both pointers that this is a string, and at the same time to the length. As soon as the number becomes `0xFF`, then this indicates that the length continues as a varint, minus the number that is written in the type

Next are simple data types

| HeadByte | Type         |
| -------- | ------------ |
| 07       | bool - false |
| 08       | bool - true  |
| 09       | null         |

### Empty

Data types responsible for skipping them.

| HeadByte | Type        | Description             | Pseudo-syntax                  |
| -------- | ----------- | ----------------------- | ------------------------------ |
| 0e       | empty       | Single empty field      | \| hb \|                       |
| 0f       | empty count | Empty for number values | \| hb \| count in uvarint32 \| |

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
