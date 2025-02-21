<div align="center">
  <h1>LWF</h1>
  <p>Lightweight Format - A format for storing data by writing sequential blocks of data, without using any designations</p>
  <img src="docs/icon.svg" width="64">
</div>

# How it works? And For what?

This format stores data based on its location in a schema. Those. saves them so that they are in the right place according to the scheme.

A format designed to store data compactly while still being human readable and editable, and using with compress algorithms.

## Basics

### Syntax

The entire file consists of blocks of data written sequentially. Before the block there is an index that allows you to distinguish the data.

Example:

```
| - index
 | - begins of block
  | - all data separated by , and for missing data is ,,
a[Hello World!!!,1000,true,,,false]
```

Schema provides the order of writing data inside the block, and also their keys for returning to the form of an object, and the reverse process.

Example schema:

```ts
const schema: LWFSchema = {
	a: {
		key: "message",
		args: ["message", "length", "verified", "name", "grammarCheck"],
	},
};
```

And it's returns object like that!

```ts
{
  message: {
    message: "Hello World!!!",
    length: 1000,
    verified: true,
    grammarCheck: false
  }
}
```

# Docs

More information about schemas and working [here](./docs/Basics.md)

# License

[MIT](./LICENSE.txt)
