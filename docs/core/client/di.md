# DI

The client uses its own `DIService` instance as its application container, mirroring the same pattern as the server. Hooks register concrete implementations into it during startup, and facades expose those implementations as lazy proxies that can be imported anywhere in the app.

For a reference on the `DIService` API (`set`, `get`, `has`, `singleton`, `proxy`, etc.) see the [shared DI service docs](../../shared/services/di.md).

## The client DI instance

A single `DIService` instance is created in `client/utils/di.ts` and exported as the client-wide container:

```ts
// client/utils/di.ts
import DIService from '#shared/services/di.service.ts'

const di = new DIService()

export default di
```

In development mode, it is also exposed as `globalThis.di` for inspection in the browser console.

## Startup sequence

The client has two entry points that both follow the same container setup flow: the browser entry (`entry-client.ts`) for hydration, and the SSR entry (`entry-server.ts`) for server-side rendering.

Both populate the container from the server-injected snapshot and then run the lifecycle:

```ts
// entry-client.ts (browser)
di.loadFromRecord(window.__CONTAINER__ || {})
config.loadFromRecord(window.__CONFIG__ || [])

await lifecycle.register()
await lifecycle.load()
await lifecycle.boot()

app.mount('#app')
```

```ts
// entry-server.ts (SSR)
di.loadFromRecord(options.container || {})

await lifecycle.register()
await lifecycle.load()
await lifecycle.boot()
```

The `window.__CONTAINER__` snapshot is serialized by the server before sending the HTML, allowing certain values to be pre-populated on the client without an extra request.

## Hooks

Client hooks live in `client/hooks/` and are loaded automatically via `import.meta.glob` — no manual registration needed. Each hook extends `LifecycleHook` and follows the same `register → load → boot` pattern as the server.

The typical pattern:

- **`onRegister`** — instantiate the service and call `di.set()` to register it
- **`onLoad`** — retrieve with `di.get()` and wire up dependencies
- **`onBoot`** — retrieve and start/attach to the Vue app

```ts
// client/hooks/router.hook.ts
export default class RouterLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const router = createRouter()
        di.set('router', router)
    }

    public async onLoad(): Promise<void> {
        const router = di.get<Router>('router')
        router.beforeEach(setupGuard)
        // add routes...
    }

    public async onBoot(): Promise<void> {
        const router = di.get<Router>('router')
        const app = di.get<App>('app')
        app.use(router)
    }
}
```

Client hooks use **string keys** (e.g. `'router'`, `'app'`) rather than class constructors, since the registered values are often framework instances (Vue `App`, Vue Router) rather than custom service classes.

## Facades

Client facades follow the same proxy pattern as the server. They are importable constants that resolve the real instance at call time:

```ts
// client/facades/router.facade.ts
const router = di.proxy<Router>('router')
export default router
```

```ts
// client/facades/app.facade.ts
const app = di.proxy<App>('app')
export default app
```

The `logger` facade is a special case — it registers its own default instance at import time, so it is available immediately without waiting for the lifecycle:

```ts
// client/facades/logger.facade.ts
const client = new ClientLoggerService()
di.set('logger', client)

const logger = di.proxy<ClientLoggerService>('logger')
export default logger
```

## Pre-registered values

Two things are populated **before** the lifecycle runs and are available to all hooks from `onRegister` onwards:

| Key | Value | Description |
|---|---|---|
| `'logger'` | `ClientLoggerService` | Registered at import time by `logger.facade.ts` |
| `'isServer'` | `boolean` | Set in each entry point (`true` in SSR, `false` in browser) |
| `'state'` | `Record<string, any>` | Server-injected initial state (`window.__STATE__`) |
