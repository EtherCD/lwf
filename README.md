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

## How it works? And For what?

This format stores data based on its location in a schema. Those. saves them so that they are in the right place according to the scheme.

A format designed to store data compactly while still being human readable and editable, and using with compress algorithms.

## Basics

### Syntax

The entire file consists of blocks of data written sequentially. Before the block there is an index that allows you to distinguish the data.

Example of syntax:

```
| - index
 | - begins of block
  | - all data separated by , and for missing data is ,,
a[Hello World!!!,1000,true,,,false]
```

Schema provides the order of writing data inside the block, and also their keys for returning to the form of an object, and the reverse process.

Example schema and using:

```ts
const schema: LWFSchema = {
  a: {
    key: 'message',
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
LWF.parse(result, schema) // Returns object.
```

## Special

Thanks to
[@mirdukkkkk](https://github.com/mirdukkkkk) for fixing and writing more technical competently guide ❤️

## License

[MIT](./LICENSE.txt)
