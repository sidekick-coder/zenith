# DI Service

`DIService` is a lightweight dependency injection container backed by a `Map`. It stores named values — instances, primitives, or anything else — and retrieves them by key. Both the server and the client have their own DI container used to wire up services at startup.

## Keys

Entries can be stored and retrieved by three key types:

- **String** — e.g. `'router'`, `'isServer'`
- **Symbol** — for private or collision-free keys
- **Constructor** (class) — when a class is used as a key, the container stores it under the class's `.name` string, so `di.set(MyService, instance)` and `di.get(MyService)` resolve to `'MyService'` internally

## API

### `set(key, value)`

Registers a value in the container. If the key is a constructor or object, the class name is used.

```ts
di.set('isServer', true)
di.set(ConfigService, new ConfigService())
```

### `get<T>(key): T`

Retrieves a value. Throws if the key is not registered.

```ts
const config = di.get<ConfigService>(ConfigService)
const isServer = di.get<boolean>('isServer')
```

### `has(key): boolean`

Returns `true` if a value is registered under the given key.

```ts
di.has(ConfigService) // true | false
```

### `singleton<T>(constructor): T`

Returns the existing instance if already registered, otherwise creates one with `new constructor()` and registers it before returning.

```ts
const service = di.singleton(MyService)
```

### `proxy<T>(key): T`

Returns a lazy proxy for a registered value. Property reads and method calls are forwarded to the real instance at call time. This means the proxy can be exported at module load time, before the actual instance has been registered.

```ts
// server/facades/config.facade.ts
const config = di.proxy<ConfigService>(ConfigService)
export default config
```

Any call on `config` will resolve the real `ConfigService` instance from the container at that moment. If the instance is replaced (e.g. swapped from `ConfigFSService` to `ConfigS3Service`), facades automatically reflect the new one without re-importing.

> [!WARNING]
> The proxy only intercepts **top-level property access**. Chained deep access (e.g. `config.entries.size`) does not go through the proxy — it reads the real object directly and will not re-resolve on subsequent access. If you need to access a deep property, use `di.get()` directly instead:
> ```ts
> // ❌ deep access through a proxy facade — unreliable
> config.entries.size
>
> // ✅ resolve the instance first, then access deeply
> di.get<ConfigService>(ConfigService).entries.size
> ```

### `loadFromRecord(record)`

Bulk-registers all entries from a plain object. Useful for hydrating the container from a serialized snapshot.

```ts
di.loadFromRecord(window.__CONTAINER__ || {})
```

### `toRecord(): Record<string, any>`

Exports all entries as a plain object. Symbol keys are stringified.

### `keys(): EntryKey[]`

Returns all registered keys.

## Usage pattern

The typical pattern in this codebase is:

1. At startup, **register** concrete instances into the container using `set()`
2. Expose them as **facades** via `proxy()` so the rest of the code imports a stable reference
3. The facade always points to whatever is currently registered, making it easy to swap implementations (e.g. different config drivers) without changing call sites

```ts
// hook registers the right implementation
di.set(ConfigService, new ConfigFSService(options))

// facade is a proxy — always resolves the current instance
import config from '#server/facades/config.facade.ts'
config.get('app.name') // works immediately
```
