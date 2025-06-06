<div align="center">
  <img src="docs/logotype.svg" height="108" alt="LWF">
  <p>A very compact, compression friendly, binary format for storing JSON like objects.</p>
  </hr>

  <img src="https://img.shields.io/npm/last-update/lwf?style=flat-square"/>
  <img src="https://img.shields.io/bundlephobia/min/lwf?style=flat-square&color=%2300cc99">
  <img src="https://img.shields.io/npm/v/lwf?style=flat-square">

<hr/>
<p>Guide to Using This Format</p>
<a href="./docs/Usage.md">[🇬🇧,English]</a>
<hr/>

</div>

# About

The format is designed to store large amounts of data more compactly, to compact packet sending, to work in browsers, and so on.

It is a very compact and fast binary format due to:

1. Recording only fields, which is a major simplification of the format data.
2. Using compact varint, which is often faster than checks and the like, to determine the bit depth of numbers. It is also compact in itself
3. The encoding of fractional numbers is more compact by storing the denominator as a varint and the numerator as a power of 10. If this record is larger than 8 bytes, then this library will automatically write it using another more powerful method `ieee754`
4. Data blocks are the most compact data unit here, only one byte is written for an object, by which the format is oriented. If it is an array, then 2 bytes (2 variant numbers).

Library Features:

1. The performance of writing values ​​here is very fast.
2. The encoding of the object as a whole is close in speed to JSON (often 2 times slower than JSON)

-   When JSON takes `88ms` to build `200**2` objects, the library takes `233ms`

3. Fully native implementation.

-   Since native implementations of compression algorithms on js are slow, and wasm is not supported by all browsers, this library is perfect for its compactness and processing speed.

Please see the guide to understand the limitations of the current implementation.

## Compactness and compression

An object with an array of 200^2 objects `{x:0,y:0,color:"#000000"}`. When converted to json it is 1363.29Kb in size, in lwfb 614.06Kb.

The format focuses on ensuring that even if data markup is needed, it should be in a repeating format, allowing compression to work more efficiently.
For example how to write schemas

### Usage example

For a more precise understanding of how to use, again, look at the [guide](./docs/Usage.md)

```ts
// In ts
import lwf from "lwf"
// In CommonJS
const lwf = require("lwf")

const schema = new lwf.Schema{
    a: {
      isArray:true,
      fields: ["message", "length", "verified", "name", "grammarCheck"]
    }
}

const object = [
  {
    message: "Hello World!!!",
    length: 1000,
    verified: true,
    grammarCheck: false
  }
]

// Returns UInt8Array
const buffer = lwf.encode(object, schema)
// Returns object or array
const array = lwf.decode(result, schema)
```

## Performance

On the Xeon E3-1230 v2 processor, these are the numbers you get, compared to JSON

Objects to check - array below, repeated 200^2 times

```json
{
    "int": -4503599627370494,
    "uint": 9007199254740990,
    "floatFe": 56294995.3421312,
    "double": 5629499.5342131210001,
    "string": "Lorem... +331 length"
}
```

```
┌─────────┬────────┬─────────────┬─────────────┐
│ (index) │ format │ process     │ millisecond │
├─────────┼────────┼─────────────┼─────────────┤
│ 0       │ 'JSON' │ 'stringify' │ 82          │
│ 1       │ 'JSON' │ 'parse'     │ 56          │
│ 2       │ 'LWF'  │ 'encode'    │ 200         │
│ 3       │ 'LWF'  │ 'decode'    │ 130         │
└─────────┴────────┴─────────────┴─────────────┘
```

## Special

Thanks to
[@mirdukkkkk](https://github.com/mirdukkkkk) for fixing and writing more technical competently guide ❤️

## License

[BSD-3-Clause](./LICENSE.txt)
