# DI

The server uses a single shared `DIService` instance as its application container. It is the backbone that connects lifecycle hooks to facades — hooks register concrete service implementations into it, and facades expose those implementations to the rest of the codebase via lazy proxies.

For a reference on the `DIService` API (`set`, `get`, `has`, `singleton`, `proxy`, etc.) see the [shared DI service docs](../../shared/services/di.md).

## The server DI instance

A single `DIService` instance is created in `server/facades/di.facade.ts` and exported as the server-wide container:

```ts
// server/facades/di.facade.ts
import DIService from '#shared/services/di.service.ts'

const di = new DIService()

export default di
```

All hooks and facades import this same instance, so everything registered in a hook is immediately available through any facade.

## Startup sequence

The server entry point (`index.ts`) wires everything together in a fixed order:

1. **Env** is loaded directly (no DI needed — it has no dependencies)
2. **Logger** is registered into the container manually before the lifecycle starts, so all hooks can use it
3. All files in `server/hooks/` are imported and instantiated automatically
4. The **lifecycle** runs three phases in order: `register → load → boot`

```ts
// index.ts (simplified)
env.load()

di.set(LoggerService, logger)

const hooks = await importAll(basePath('server/hooks'))

lifecycle.add(...hooks)

await lifecycle.register()
await lifecycle.load()
await lifecycle.boot()
```

## Hooks

Hooks are the only place where services are instantiated and registered into the DI container. Each hook extends `LifecycleHook` and has an `order` number that controls execution sequence (lower runs first).

The typical pattern across all hooks is:

- **`onRegister`** — instantiate the service and call `di.set()` to register it
- **`onLoad`** — retrieve the service with `di.get()` and wire up dependencies
- **`onBoot`** — retrieve the service and start it

```ts
// server/hooks/router.hook.ts
export default class RouterLifecycleHook extends LifecycleHook {
    public order = 97

    public async onRegister(): Promise<void> {
        const router = new RouterRegister({ ... })
        di.set(RouterService, router)  // register
    }

    public async onLoad(): Promise<void> {
        const router = di.get<RouterRegister>(RouterService)  // retrieve
        router.addDir(serverPath('routes'), { module: 'root' })
    }

    public async onBoot(): Promise<void> {
        const router = di.get<RouterRegister>(RouterService)
        await router.load()
    }
}
```

Hook files in `server/hooks/` are loaded automatically on startup — no manual registration is needed.

## Facades

Facades are thin wrappers that expose DI-registered services as importable module-level constants. They use `di.proxy()` so they can be imported before the lifecycle runs, and they always reflect whatever instance is currently registered.

```ts
// server/facades/config.facade.ts
import di from './di.facade.ts'
import ConfigService from '#shared/services/config.service.ts'

const config = di.proxy<ConfigService>(ConfigService)

export default config
```

Because `proxy()` resolves the real instance at call time, a facade imported at the top of any file will work correctly even though the service is registered later by a hook.

## Pre-registered services

Two services are registered **before** the lifecycle starts and are therefore available to all hooks from `onRegister` onwards:

| Token | Description |
|---|---|
| `LoggerService` | Application logger (Winston) |

The `env` facade is the one exception — it is not in the DI container at all. It is a plain singleton instantiated directly at module load time, since it has no dependencies and must be available before anything else runs.
