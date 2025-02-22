# Basics of Using the Format

The format stores data in blocks without assuming how they will be decoded later. This decision was made for the sake of compactness and more efficient compression using algorithms.

You need to create a schema that describes:
a. What data is contained within the object.
b. How to convert this data into a string.
c. How to restore the data from the string format.

Currently, the format is under development and functional, but it may not be universal for all use cases.

## Nesting and Objects

The simplest schema looks like this:

```ts
const schema: LWFScheme = {
  // Define the header that will be written before the data block
  // Format: {header}[data]
  // In this case, the header will be "a"
  a: {
    // The key of the object that will be processed in this data block
    key: 'store',
    // All nested data that can be written in a single string, excluding objects and arrays
    // Keys should be listed in an order that ensures maximum efficiency
    // This is not a strict requirement, but it's worth noting that, for example, ["x", "y"]
    // will be inefficient if the first key "x" is often missing, as it will result in a[,,,10]
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
LWF.parse(result, schema) // Should return an object identical to the input
```

Now let’s add a nested object, for example, to specify what our store sells:

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    // Specify the header of the schema that will be used to transform the data inside
    // the store object
    includes: ['b'],
  },
  b: {
    key: 'sells',
    // Indicate that the object under this key is an array
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
LWF.parse(result, schema) // Should return an object identical to the input
```

To work with objects whose keys are unique identifiers (e.g., "forSale"), we can specify that it is an object with dynamic keys. In this example, we implement it as follows:

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    includes: ['b'], // Connect the schema for the nested object
  },
  b: {
    key: 'forSale',
    // Indicate that the object under this key is an object with dynamic keys
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
LWF.parse(result, schema) // Should return an object identical to the input
```

These were the basic principles of working with this format and its usage.

## More Complex Schemas

To specify how to work with the root element, we need the following schema:

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    // Indicate that this schema will be the root and apply to the entire object
    root: true,
    // Further, we can specify additional parameters
    isKeyedObject: true,
    // Or
    isArray: true,
    // As well as nested objects
    included: [],
  },
}
```

Since the format ignores empty values and does not include them in the final object, to specify arguments that may be empty but are always required, we can do the following:

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    root: true,
    // Specify required arguments
    // ["Argument name", "Default value if the argument is missing"]
    requiredArgs: [['name', '']],
  },
}
```

If we need to create an object but write all the arguments inside a nested object:

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    // In this case, the data will be written not into the object itself but into a nested object with the key "info"
    in: 'info',
  },
}
```

This concludes the description of the format for now. I will continue to develop and improve it.
