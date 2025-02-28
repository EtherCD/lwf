# 1.4.x

- [x] The type of storage of boolean data has been changed; now it is stored in the form `+ -`.
- [x] Added escaping for strings, now you can use special characters.
- [x] Fixed a bug with the fact that the lecher could endlessly process non-processable data. An error may occur during further development.

# 1.3.x

- [x] Added MIT license file.
- [x] Changes in Readme for make it more informative.
- [x] [Fixes and new language (🇮🇩​​)](https://github.com/EtherCD/lwf/pull/1)
- [x] Added more comments with examples how to use.

Readme stuff

- [x] Changed logo to more modern.

# 1.2.x

- [x] Fixed a bug when working with empty arguments and `isKeyedObject` in the schema.
- [x] Fixed the use of a regular Error for custom Errors, to add more information to errors.
- [x] Stringify now process `isKeyedObject` more correctly.

Readme stuff

- [x] Added new logotype, and some badges.

Development stuff

- [x] Added .prettierrc

# 1.1.x

> [!WARNING]
> Doesn't work in commonjs because "main" in package.json points to a non-existent index.cjs.
> Its bug is fixed in version 1.2.0.

- [x] Added root objects that describe what data and in what format is stored inside (`root: true` feature in schema).
- [x] Added support for an object with dynamic keys (`isKeyedObject: true` feature in schema).
- [x] Added support for an arrays (`isArray: true` feature in schema).
- [x] Added an exceptions for `stringify` and `parse` (LexerError, ParsingError, StringifyError, SchemaError).

# 1.0.x

> [!WARNING]
> Doesn't work in commonjs because "main" in package.json points to a non-existent index.cjs.
> Its bug is fixed in version 1.2.0.
