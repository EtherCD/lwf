<div align="center">
  <img src="docs/icon-small.svg" height="108" alt="LWF">
  <p>Lightweight Format - A format for storing data by writing sequential blocks of data, without using any designations</p>
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

## What is this and why?

This is a data storage format similar to JSON, YAML, TOML, and others. But its distinctive feature is its compactness.

This is achieved by the fact that the data is stored in its pure form, without designations of their nesting and order. To indicate this, a diagram is used that describes the order of parsing data and assembling it into a format.

Can be useful for sending data between client and server; the format is also designed to work with compression.

## How much more compact?

An object like the one in [test/index.test.ts](./test/index.test.ts) has a size of 21 Kilobytes. Once converted to lwf format, it takes up 11 Kilobytes.

The format is more efficient in saving space when used with objects in which the data takes up less space than the structure of this same data

For example, like a map for a game, where the data is often less than its descriptions. Like this example

```ts
{
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
```

In this case, in lwf format the data will look like this:

```
p[Test Map]
c[,,#ffffff]
a[0,0,0,0]
z[teleport,0,0,320,64]
```

## Data storage format

### Syntax

Data is stored in so-called blocks, where the values ​​inside it are data. And the letter before the table of contents block.

The format relies on sequential recording of data in a row, which means it may have gaps

```
a - header
[Something,1000] - block of data
[,,] - indicates a pass to specify data in the next argument
```

### Schema

For correct work with data, and correct conversion to a string and return from. You need to write a diagram that describes the data structure

To correctly write a schema, you will need to fully understand what data may be in the object.

A simple example of using the schema:

```ts
const schema: LWFSchema = {
  a: {
    // Key of the object that will be processed in this data block
    key: 'message',
    // Sequentially written data keys that will be listed in the list of values ​​of this data
    args: ['message', 'length', 'verified', 'name', 'grammarCheck'],
  },
}

const object = {
  message: {
    message: 'Hello World!!!',
    length: 1000,
    verified: true,
    grammarCheck: false,
  },
}

const result = LWF.stringify(object, schema) // Returns a[Hello World!!!,1000,true,false]
LWF.parse(result, schema) // Should return an object identical to the input
```

## Special

Thanks to
[@mirdukkkkk](https://github.com/mirdukkkkk) for fixing and writing more technical competently guide ❤️

## TODO, and other

The format is currently under development, but is already usable. It needs to be improved for greater versatility. [TODO](./TODO.md)

## License

[MIT](./LICENSE.txt)
