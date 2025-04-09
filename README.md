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

> The format stores data according to the scheme, see the guide
>
> There are also some limitations

# About

This format uses a scheme for writing and reading data. The main goal of the format is compactness and compression friendliness. Therefore, to make the record even more compact, the scheme stores the names of the fields by which the data is stored. And the data itself in its pure form is stored in binary form.

This is the principle of data storage. More details can be found in the [specification](./docs/Specification.md)

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
│ 0       │ 'JSON' │ 'stringify' │ 80          │
│ 1       │ 'JSON' │ 'parse'     │ 53          │
│ 2       │ 'LWF'  │ 'encode'    │ 203         │
│ 3       │ 'LWF'  │ 'decode'    │ 1002        │
└─────────┴────────┴─────────────┴─────────────┘
```

Parsing is not the fastest process at the moment. The approach to parsing will be changed soon.

## Special

Thanks to
[@mirdukkkkk](https://github.com/mirdukkkkk) for fixing and writing more technical competently guide ❤️

## License

[BSD-3-Clause](./LICENSE.txt)
