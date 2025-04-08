# Usage lwf-js lib

## Limitations

Currently, the library cannot write arrays in arrays, nor array-likes in array-likes.

BigInt numbers are limited to 128 bits

[Issue with array and map types](https://github.com/EtherCD/lwf/issues/3)

## Schema

To create a scheme create an instance of the `Schema` class.

Example code:

```ts
import lwf from "lwf"

const schema = new lwf.Schema({})
```

### Basics of schema

First, the principle of recording according to the data scheme. This writes only the field values ​​of the objects specified in the schema.

The main thing to remember is that fields not specified in the schema will not be serialized.

Since this is the first element of the diagram, it writes the root element itself.

```jsonc
{
    // Any key name by which you will organize nesting
    "a": {
        "fields": ["name"]
    }
}

// Object that describes
{
  "name": "asd",// any value, but not object
  "age": "any", // will not to be serialized
}
```

Since the fields in the schema only describe values, not objects, we need to add a second schema with any absolute name, and point to it with the `nested` field.

```jsonc
{
    "a": {
        "fields": ["name"],
        "nested": ["b"]
    },
    // New schema describing a nested object
    "b": {
      "key": "nested", // Nested objects must always have a key.
      "fields": ["foo"]
    }
}

// Object that describes
{
  "name": "asd",
  "nested": {
    "foo": "bar"
  }
}
```

Just like with `simple values`, the library will not write the object, but skip it

### Arrays and Array-like objects

To describe an array, we need to keep in mind that if we specify that it is an array, then the diagram describes the values ​​of the array, not the array itself. In addition to `key`, the array itself will be written to the main object.

```jsonc
{
    "a": {
        "nested": ["users"]
    },
    "users": {
        "key": "users",
        "isArray": true,
        "fields": ["name","age","email"]
    }
}

// Object that describes
{
  "users": [
    {"name":"Some one","age":20,"email":"20@mail.com"}
  ]
}
```

We can also make the root object an array.

```jsonc
{
    "a": {
        "isArray": true,
        "fields": ["name","age","email"]
    }
}

// Object that describes
[
  {
    "name": "Some one",
    "age": 20,
    "email": "20@mail.com"
  }
]
```

An array-like object is a data structure that behaves like an array: it has ordered keys, but it is not a full-fledged array.

To describe an array-like object, we need to specify `isMap` in the schema.

```jsonc
{
    "a": {
        "isMap": true,
        "fields": ["name","age","email"]
    }
}

// Object that describes
{
  "1": {
    "name": "Some one",
    "age": 20,
    "email": "20@mail.com"
  },
  "2": {
    "name": "Some two",
    "age": 20,
    "email": "20@mail.com"
  }
}
```
