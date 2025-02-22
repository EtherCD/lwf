# How to use the format

The format basically records data only as blocks, and has no idea how it will be further decrypted. This was done for the sake of compactness, and the possibility of more compact compression using algorithms.

Therefore, you need to write a schema that describes what data is inside the object, how to turn it into a string, and how to return it from the format.

At the moment, the format is under development and is in working condition, but may not be situational for some cases.

## Nesting and objects

The simplest schema looks like this:

```ts
const schema: LWFScheme = {
  // Describe the table of contents that will be written before the data block
  // That is {title}[data]
  // Let it be
  a: {
    // The key of the object that we will parse into this data block
    key: 'store',
    // All nested data that we can write in a row, not including objects or arrays
    // There should be keys in a sequence that will be efficient enough
    // This, of course, doesn’t have to be so complicated, but it’s just worth considering that for example ["x", "y"]
    // It will not be effective given that the first x will often be missing, because it will turn into a[,,,10]
    args: ['name', 'owner'],
  },
}

const object = {
  store: {
    name: 'Best Computers!',
    owner: 'Eliot',
  },
}

const result = LWF.stringify(object, schema) // Returns a[Best Computers!,Eliot]
LWF.parse(result, schema) // Will returns object.
```

Now we want to add a nested object, for example what our store sells

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    // Specify the table of contents schema that will be used to transform the data inside
    // store object
    includes: ['b'],
  },
  b: {
    key: 'sells',
    // Indicates that the object by key is an array
    isArray: true,
    args: ['name', 'price'],
  },
}

const object = {
  store: {
    name: 'Best Computers!',
    owner: 'Eliot',
    sells: [
      {
        name: 'Cool processor',
        price: 'Nice money',
      },
    ],
  },
}

const result = LWF.stringify(object, schema) // Returns a[Best Computers!,Eliot]b[Cool processor,Nice money]
LWF.parse(result, schema) // Will returns object.
```

To add a nested object with keys, for example the same ID forSale. We'll do it this way

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    includes: ['b'],
  },
  b: {
    key: 'forSale',
    // Indicates that the object by key is an object with nested other keys
    isKeyedObject: true,
    args: ['name', 'price'],
  },
}

const object = {
  store: {
    name: 'Best Computers!',
    owner: 'Eliot',
    forSale: {
      0: {
        name: 'Cool processor',
        price: 'Nice money',
      },
    },
  },
}

const result = LWF.stringify(object, schema) // Returns a[Best Computers!,Eliot]b[0,Cool processor,Nice money]
LWF.parse(result, schema) // Will returns object.
```

These were the basics of this format and its use.

## More advanced schemas

To indicate how we work with the root element, we need such a diagram

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    // We indicate that this scheme will work as a root one, and will extend to the root of the entire object
    root: true,
    // Next we can specify everything we need
    isKeyedObject: true,
    // Or
    isArray: true,
    // And nested objects
    included: [],
  },
}
```

Because the format omits all the voids and does not add them to the final object.
To specify arguments that can be empty, but are always required, we can do this:

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    root: true,
    // Specify those required arguments
    // ["Argument name", "Replacement if not present"]
    requiredArgs: [['name', '']],
  },
}
```

If we need to create an object but write all the arguments inside the nested object

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    // Тогда оно запишет не в обьект, а в вложенный обьект с ключом info
    in: 'info',
  },
}
```

This is where the format ends for now, I will continue to develop it and improve it
