<div align="center">
  <img src="docs/icon.svg" height="108" alt="LWF">
  <p>Lightweight Format - A binary format for storing data by writing sequential blocks of data, without using any designations</p>
  </hr>

  <img src="https://img.shields.io/npm/last-update/lwf"/>
  <img src="https://img.shields.io/github/languages/code-size/EtherCD/lwf?">
  <img src="https://img.shields.io/npm/v/lwf">

<hr/>
<p>Guide to Using This Format</p>
L[🇬🇧,<a href="./docs/Basics-en.md">English</a>]
L[🇷🇺,<a href="./docs/Basics-ru.md">Russian</a>]
L[🇲🇨,<a href="./docs/Basics-id.md">Indonesian</a>]
<hr/>

</div>

> ![IMPORTANT]
> Currently binary variant in dev :3

## What is this and why?

This is a binary data storage format with a structure similar to JavaScript Object or Array. But its distinctive feature is its compactness writing data.

The main idea on which the format is based is that common formats like (JSON, YAML, TOML...) store data with their markup. Their markup describes how the data is nested, which fields contain which data. But for data that is repeated constantly, or partially, you can come up with a simpler option for storing data.

This is how this format was invented, the idea is that only the field values ​​will be written into blocks, in a certain sequence. And the serialization result itself will not contain their markup.

The data markup is taken out into a schema that you will need to write to work with this format.

The format was created mainly to compact packets before sending, as well as for the most compact storage of data.

## How much more compact?

The test data package is located here [test/index.test.ts](./test/index.test). When stored as json, it takes up 21.23 KB. When stored in lwfb, it takes up only 6.52 KB.

An object with an array of 200^2 objects that is in [test/pixels.test.ts](./test/pixels.test). When converted to json it is 1123.93Kb in size, in lwfb 575Kb.

If the data contains more numbers, then the binary nature of lwf will allow it to be compressed into just 1,2,4,8 bytes, depending on the bit depth.

Also, static typing will allow more compact storage of data, but it removes only 1 byte describing the data type. Also, a type check is implemented, but typing is currently available only for one of the types.

For example how to write schemas

```ts
const object = {
  data: {
    name: "Test Map",
    color: {
      fill: "#ffffff"
    }
  },
  areas: [
    {
      properties: {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      },
      zones: [
        {type: "teleport", x: 0, y: 0, w: 320, h: 64}
      ]
    }
  ]
}

const schema = {
  // Root object
  a: {
    // Describes included schemas for parsing objects
    // Format can't process objects without schema
    includes: ["a", "d"]
  },
  d: {
    // Field at parent object where object will write.
    key: "data",
    // Describes fields names inside object.
    args: ["name"],
    includes: ["c"]
  },
  c: ...
  a: {
    // Object inside array will be processed according to this scheme
    isArray: true,
    key: "areas",
    includes: ["z"]
  },
  z: {
    isArray: true,
    key: "zones",
    args: ["type", "x","y","w","h"],
    // If we knows what types of fields in object, we can describe it
    types: ["str", "int", "int", "int", "int"]
  }
}
```

The format is also great for compression, here is an example sizes gets from compression with lz4:

```
4.6 KB package.json.lz4
4.1 KB package.lwf.lz4
2.6 KB package.lwfb.lz4
 21 KB package.json
9.9 KB package.lwf
6.5 KB package.lwfb
```

## How it contains data?

Specs for format is not finished yet. But half of my ideas wrote in [this file](./specs.md)

### Schema

For correct work with data, and correct conversion to a string and return from. You need to write a diagram that describes the data structure

To correctly write a schema, you will need to fully understand what data may be in the object.

A simple example of using the schema:

```ts
const schema: Schema = {
    a: {
        // Sequentially written data keys that will be listed in the list of values ​​of this data
        args: ['message', 'length', 'verified', 'name', 'grammarCheck'],
    },
}

const object = {
    message: 'Hello World!!!',
    length: 1000,
    verified: true,
    grammarCheck: false,
}

const result = lwf.serialize(object, schema) // Returns UInt8Array, with compact stored data.
lwf.deserialize(result, schema) // Should return an object identical to the input
```

## Deprecated format?

For compatibility the previous implementation was left here, it is slower. Although it can be useful if data readability is important.

## Performance

The new binary implementation of the format works faster than its predecessor.
Let's look at the numbers for [test/pixels.test.ts](./test/pixels.test) with 200^2 length array.

CPU: i5-3330

```
┌─────────┬──────┬─────┬──────┐
│ (index) │ LWFB │ LWF │ JSON │
├─────────┼──────┼─────┼──────┤
│ 0       │ 59   │ 178 │ 11   │
└─────────┴──────┴─────┴──────┘
```

Binary realization is more efficient, but why? The serialization code is optimized to the point of horror. Use UInt8Array instead of dynamic array, non-recursive implementation, use of extra arrays is minimized.

## Future?

I expect to bring the format to a more universal form. Add the ability to create these schemes automatically, and maybe even write them to files. But since schemes take up almost as much space as simple descriptions in JSON, the difference in size will be minimal. Of course, until an object starts using 2 or more such objects. There are also problems with the design of the format, which is aimed at optimizing size and speed.

## Special

Thanks to
[@mirdukkkkk](https://github.com/mirdukkkkk) for fixing and writing more technical competently guide ❤️

## TODO, and other

The format is currently under development, but is already usable. It needs to be improved for greater versatility. [TODO](./TODO.md) [ChangeLog](./CHANGELOG.md)

## License

[MIT](./LICENSE.txt)
