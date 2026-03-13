# Lifecycle Service

`LifecycleService` orchestrates application startup and shutdown by running a ordered set of hooks through four sequential phases: **register → load → boot → shutdown**. Both the server and the client have their own `LifecycleService` instance.

## Instantiation

The constructor accepts an optional partial configuration object:

```ts
import LifecycleService from '#shared/services/lifecycle.service.ts'

const lifecycle = new LifecycleService({
    debug: true,
    logger: myLogger.child({ label: 'lifecycle' }),
})
```

| Option | Type | Default | Description |
|---|---|---|---|
| `debug` | `boolean` | `false` | Logs every hook operation (add, register, load, boot, shutdown). |
| `logger` | `LoggerService` | `new LoggerService()` | Logger instance used for error and debug output. |
| `hooks` | `Map<string, LifecycleHook>` | `new Map()` | Pre-populate the hook map (rarely needed). |

After creating the instance, hooks are loaded and the lifecycle is run:

```ts
// Server (index.ts)
const lifecycle = new LifecycleService({
    debug: env.get('LIFECYCLE_DEBUG'),
    logger: logger.child({ label: 'lifecycle' }),
})

const hooks = Object.values(await importAll(basePath('server/hooks')))
    .map(m => m.default || m)
    .filter(HookClass => HookClass.prototype instanceof LifecycleHook)
    .map(HookClass => new HookClass())

lifecycle.add(...hooks)

await lifecycle.register()
await lifecycle.load()
await lifecycle.boot()
```

```ts
// Client (lifecycle.facade.ts)
const lifecycle = new LifecycleService({
    debug: config.get('lifecycle.debug') || config.get('app.debug'),
    logger: logger.child({ label: 'lifecycle' }),
})

const hooks = Object
    .values<any>(import.meta.glob('../hooks/**/*.hook.ts', { eager: true }))
    .map(hook => hook.default || hook)

lifecycle.add(...hooks)
```

## Hooks

Each hook is a class that extends `LifecycleHook`:

```ts
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class MyHook extends LifecycleHook {
    public async onRegister(): Promise<void> {}
    public async onLoad(): Promise<void> {}
    public async onBoot(): Promise<void> {}
    public async onShutdown(): Promise<void> {}
}
```

All four methods are optional — only override the ones your hook needs.

### `hook_id`

Every hook has a `hook_id` string used as its key in the internal `Map`. By default it is set to the class name (`this.constructor.name`), so each class is naturally unique. You can override it in the class body to assign a custom id:

```ts
export default class MyHook extends LifecycleHook {
    public hook_id = 'my-custom-id'
}
```

Because hooks are stored by `hook_id`, adding two hooks with the same id replaces the first.

### `order`

An optional numeric property that controls execution order within each phase. Hooks are sorted ascending — lower numbers run first. Hooks without an `order` value default to `0`.

```ts
export default class EarlyHook extends LifecycleHook {
    public order = -10
}

export default class LateHook extends LifecycleHook {
    public order = 100
}
```

## API

### `add(...hooks)`

Registers one or more hooks. Accepts class constructors (instantiated automatically) or existing instances.

```ts
lifecycle.add(RouterHook, AuthHook)          // constructors
lifecycle.add(new RouterHook(), new AuthHook()) // instances
```

### `register(options?)`

Calls `onRegister()` on every hook in order. This is the first phase — use it to instantiate services and store them in the DI container.

```ts
await lifecycle.register()
```

### `load(options?)`

Calls `onLoad()` on every hook in order. Use it to retrieve already-registered services and wire up dependencies between them.

```ts
await lifecycle.load()
```

### `boot(options?)`

Calls `onBoot()` on every hook in order. Use it to start services, attach them to the framework (e.g. `app.use(router)`), or perform any final initialisation.

```ts
await lifecycle.boot()
```

### `shutdown(options?)`

Calls `onShutdown()` on every hook in order. Use it to gracefully stop services (close DB connections, flush queues, etc.).

```ts
await lifecycle.shutdown()
```

### `list(options?)`

Returns the registered hooks sorted by `order`. Accepts an optional `exclude` filter.

### `clear()`

Removes all registered hooks from the internal map.

## Phase order

Phases always run sequentially, and hooks within each phase also run sequentially (not in parallel):

```
register → load → boot       (startup)
shutdown                      (teardown)
```

The recommended responsibilities per phase:

| Phase | Responsibility |
|---|---|
| `onRegister` | Instantiate services, call `di.set()` |
| `onLoad` | Retrieve services via `di.get()`, configure and connect them |
| `onBoot` | Start services, attach to the app, perform side effects |
| `onShutdown` | Gracefully stop services, release resources |

## Error handling

Each hook call is wrapped with `tryCatch`. If a hook throws, the error is logged with the `hook_id` attached and execution continues with the next hook — a single failing hook does not abort the entire phase.

## `exclude` option

All phase methods (`register`, `load`, `boot`, `shutdown`) and `list` accept an optional `exclude` array to skip specific hooks during that run. Items can be a `hook_id` string, a constructor, or an instance:

```ts
await lifecycle.boot({ exclude: [MyHook, 'some-hook-id'] })
```

## Debug mode

Set `debug: true` when constructing the service to log every hook operation:

```ts
const lifecycle = new LifecycleService({ debug: true })
```

This emits a debug log line for each `add`, `register`, `load`, `boot`, and `shutdown` call, prefixed with the `hook_id`.
