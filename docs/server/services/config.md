# Config (Server)

The server-side config system extends the shared `ConfigService` with persistence support. Config entries are loaded from an external storage backend on startup and written back whenever a value is set or unset at runtime.

For a reference on the base API (`get`, `set`, `has`, `unset`, etc.) see the [shared config service docs](../shared/config.md).

## Drivers

The server supports two storage backends, selected via the `CONFIG_DRIVER` environment variable.

### Filesystem (default)

When `CONFIG_DRIVER=fs` (the default), config is loaded from a directory of JSON files. The directory defaults to `storage/config/` inside the base path and can be overridden with `CONFIG_FS_PATH`.

Each file in the directory becomes a top-level config key named after the filename without the `.json` extension.

```
storage/config/
  app.json        → config.get('app')
  database.json   → config.get('database')
  smtp.json       → config.get('smtp')
```

When `set()` or `unset()` is called, the corresponding file is updated synchronously.

Relevant environment variables:

| Variable | Description |
|---|---|
| `CONFIG_FS_PATH` | Path to the config directory (default: `storage/config`) |
| `CONFIG_DEBUG` | Enable debug logging (`true`, `false`, `1`, `0`) |

### S3

When `CONFIG_DRIVER=s3`, config is loaded from an S3-compatible bucket. Files follow the same naming convention: each `.json` file maps to a top-level key.

`set()` writes back to S3 asynchronously. `unset()` for a top-level key deletes the file; for a nested key it rewrites the parent file.

Required environment variables:

| Variable | Description |
|---|---|
| `CONFIG_S3_BUCKET` | S3 bucket name |
| `CONFIG_S3_REGION` | AWS region |
| `CONFIG_S3_ACCESS_KEY_ID` | Access key ID |
| `CONFIG_S3_SECRET_ACCESS_KEY` | Secret access key |
| `CONFIG_S3_ENDPOINT` | Custom endpoint (optional, for S3-compatible services) |
| `CONFIG_S3_PREFIX` | Key prefix inside the bucket (default: `''`) |
| `CONFIG_S3_SESSION_TOKEN` | Session token (optional) |
| `CONFIG_DEBUG` | Enable debug logging (`true`, `false`, `1`, `0`) |

## Environment variable overrides

After loading from the storage backend, both drivers apply overrides from the `CONFIG` environment variable. This allows injecting config values at deploy time without modifying any files.

The value is a list of `key=value` pairs separated by `;` or newlines. Keys support dot-notation. To set a boolean value, prefix it with `bool:`.

```sh
CONFIG="app.name=Zenith;app.debug=bool:true"

# or using newlines
CONFIG="
app.name=Zenith
app.debug=bool:true
database.host=10.0.0.1
"
```

These entries are loaded with `source = 'env'` and will override any value from the storage backend.

## Lifecycle hook

The config service is initialized by `ConfigLifecycleHook` (order `1`), which runs early in the server startup lifecycle.

The hook reads the `CONFIG_DRIVER` variable, instantiates the appropriate driver, calls `load()`, and then registers the resulting service instance in the DI container under the `ConfigService` token.

```ts
// server/hooks/config.hook.ts
di.set(ConfigService, service)
```

## Server facade

Use the `config` facade to access the service anywhere on the server. It resolves the instance from the DI container via a proxy, so it always returns the driver-specific implementation registered by the hook.

```ts
import config from '#server/facades/config.facade.ts'

config.get('database.host')
config.set('app.maintenance', true)
```

## Client facade

On the client side, `config` is a plain `ConfigService` instance (the base shared class). It has no persistence layer — it acts as a simple in-memory store that can be populated at runtime (e.g. from an API response).

```ts
import config from '#client/facades/config.facade.ts'

config.set('ui.theme', 'dark')
config.get('ui.theme') // 'dark'
```

In development mode, the client instance is also exposed as `globalThis.config` for easy inspection in the browser console.
