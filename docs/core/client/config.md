# Config 

On the client side, `config` is an instance of the base `ConfigService` (the shared in-memory store). It has no persistence layer — its values are seeded by the server on every page render and are available immediately when the app boots.

For a reference on the base API (`get`, `set`, `has`, `unset`, etc.) see the [shared config service docs](../../core/shared/config.md).

## How the config reaches the client

The server assembles a `clientConfig` object during each SSR request inside `ViteService`. It then serializes it and injects it into the HTML as an inline script, which the browser can read before any JavaScript runs:

```html
<script>
    window.__CONFIG__ = { "site": { ... }, "branding": { ... }, ... };
</script>
```

### In the browser (hydration)

When the client bundle boots, it reads `window.__CONFIG__` and loads it into the `config` instance:

```ts
// client/entry-client.ts
config.loadFromRecord(window.__CONFIG__ || [])
```

All config values are then available synchronously via `config.get()` throughout the app.

### During SSR

When rendering on the server, the same `config` instance is populated per-request before the lifecycle runs:

```ts
// client/entry-server.ts
config.loadFromRecord(context.config || {})
```

This means the same Vue components read config the same way in both SSR and browser environments, with no conditional logic needed.

## What the server puts in the client config

The server does not expose the full server config to the client. Instead, `ViteService` explicitly copies only safe, public keys:

| Key | Source |
|---|---|
| `site` | `config.get('site')` |
| `branding` | `config.get('branding')` |
| `auth` | `config.get('auth')` |
| `setup` | `config.get('setup')` |
| `cookie.prefix` | `config.get('cookie.prefix')` |

Modules can add their own keys to the client config by hooking into the `vite:client-config` event on the server:

```ts
vite.on('vite:client-config', ({ config }) => {
    config.set('mymodule.someKey', 'value')
})
```

## Environment variable overrides

The `CLIENT_CONFIG` environment variable allows injecting values into the client config at deploy time, without modifying any config files. It uses the same `key=value` format as the server-side `CONFIG` variable — pairs separated by `;` or newlines, with `bool:` prefix for booleans.

```sh
CLIENT_CONFIG="site.name=Zenith;branding.color=bool:true"
```

These values are loaded first, before any server config keys are copied, so they can be overridden by server config values.

## Accessing config in the app

Use the client `config` facade anywhere in the client codebase:

```ts
import config from '#client/facades/config.facade.ts'

config.get('site.name')           // 'Zenith'
config.get('branding.logo', null) // falls back to null if not set
```

In development mode, the instance is also available as `globalThis.config` in the browser console for quick inspection.
