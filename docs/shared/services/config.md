# Config Service

`ConfigService` is a shared in-memory key-value store used to manage application configuration on both the client and the server.

It stores entries as a flat `Map<string, Entry>`, where each entry holds the key, its parsed value, and a `source` tag that indicates where it came from (e.g. `'file'`, `'env'`, `'runtime'`).

## Dot-notation

All methods support **dot-notation** to read and write nested values inside object entries.

The first segment of a dot-notation key is always the **primary key** — the top-level entry in the map. The remaining segments are resolved as a lodash path into that entry's object value.

```ts
config.set('database', { host: 'localhost', port: 5432 })

config.get('database.host') // 'localhost'
config.get('database.port') // 5432

config.set('database.host', '10.0.0.1')
config.get('database.host') // '10.0.0.1'
```

## Value parsing

When loading values, `parseValue` runs automatically. It converts strings ending in `:boolean` into actual booleans:

```ts
// "true:boolean" → true
// "false:boolean" → false
config.loadFromRecord({ 'feature.enabled': 'true:boolean' })
config.get('feature.enabled') // true
```

## API

### `get<T>(key, defaultValue?): T`

Returns the value for the given key. Supports dot-notation for nested access. Returns `defaultValue` if not found.

```ts
config.get('app.name', 'My App')
```

### `set(key, value, source?)`

Sets a value. Supports dot-notation to write into a nested path inside an existing object entry. The `source` defaults to `'runtime'`.

```ts
config.set('app.debug', true)
```

### `has(key): boolean`

Returns `true` if the key exists. Supports dot-notation.

```ts
config.has('database.host') // true
```

### `unset(key)`

Removes a value. For dot-notation keys, removes the nested path from the parent object.

```ts
config.unset('database.host')
```

### `getOne(keys[], defaultValue?): T`

Returns the first value found among the given keys. Useful for checking multiple fallback keys.

```ts
config.getOne(['smtp.host', 'mail.host'], 'localhost')
```

### `loadFromRecord(record, source?)`

Loads all entries from a plain object. Each key-value pair becomes an entry.

```ts
config.loadFromRecord({ 'app.name': 'Zenith' }, 'file')
```

### `loadFromEntries(entries, source?)`

Same as `loadFromRecord`, but accepts an array of `[key, value]` tuples.

### `toRecord(): Record<string, any>`

Exports all entries as a plain object.

### `list(): Entry[]`

Returns all entries as an array.

### `clear()`

Removes all entries from the store.
