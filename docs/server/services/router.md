# Router 

The router is the HTTP routing layer of the server. It is responsible for registering routes, attaching middleware, organizing routes into groups, resolving incoming requests to their matching route, and executing the middleware pipeline before calling the handler.

It is split into two classes:

- **`RouterService`** — core routing logic (register routes, groups, prefixes, middleware, resolve, execute)
- **`RouterRegister`** — extends `RouterService` with file/directory auto-loading

The live instance is `RouterRegister`, registered in the DI container under the `RouterService` token, and exposed via `server/facades/router.facade.ts`.

---

## Lifecycle

The router is wired up through `server/hooks/router.hook.ts` across three lifecycle phases:

### `onRegister`

A `RouterRegister` instance is created with debug settings and **global middleware** attached. Global middleware runs on every single route, regardless of group or file.

```ts
router.use(setupMiddleware, 'global')
router.use(authSilenceMiddleware, 'global')
router.use(authorizationMiddleware, 'global')
```

The instance is then stored in the DI container under `RouterService`.

### `onLoad`

The router is retrieved from DI and pointed at the `server/routes/` directory. Every `.ts`/`.js` file in that directory (excluding test files) will be imported when `load()` is called.

```ts
router.addDir(serverPath('routes'), { module: 'root' })
```

### `onBoot`

`router.load()` is called, which dynamically imports all registered files and directories. Each file's side-effects register its routes onto the shared router instance.

---

## Facade

`server/facades/router.facade.ts` exposes the router as an importable constant. It uses `di.proxy()` so it can be imported at the top of any route file before the lifecycle runs.

The facade also resolves the TypeScript context type by composing the middleware types that are registered globally (`authSilenceMiddleware` and `authorizationMiddleware`):

```ts
type Context = MiddlewareHandleResult<[typeof authSilenceMiddleware, typeof authorizationMiddleware]>

const router = di.proxy<RouterService<Context>>(RouterService)
```

This means any handler accessed through the facade will have the properties those middleware inject fully typed.

---

## Routes

Routes are registered with HTTP method helpers. The path is always relative to any active prefixes or group prefixes.

```ts
router.get('/api/health', (ctx) => ({ ok: true }))
router.post('/api/items', handler)
router.put('/api/items/:id', handler)
router.patch('/api/items/:id', handler)
router.delete('/api/items/:id', handler)
router.many(['GET', 'POST'], '/api/items', handler)  // register same handler for multiple methods
```

### Path parameters

Segments starting with `:` match any value in the request path. The matched values are available in `ctx.params`.

```ts
router.get('/users/:id', ({ params }) => {
    const id = params.id  // string
})
```

### Wildcards

A `*` segment matches everything from that point onwards.

```ts
router.get('/files/*', handler)
```

---

## Prefixes

`.prefix(path)` adds a path segment that is prepended to the next registered route or group. The prefix is consumed (reset) after use.

```ts
router.prefix('/api/users').get('/', handler)     // → GET /api/users/
router.prefix('/api/users').get('/:id', handler)  // → GET /api/users/:id
```

Multiple `.prefix()` calls stack until they are consumed:

```ts
router.prefix('/api').prefix('/users').get('/', handler)  // → GET /api/users/
```

---

## Middleware

`.use(middleware, context?)` attaches a middleware to the router. The `context` argument controls the scope:

| Context | Scope |
|---|---|
| `'global'` | Applied to every route in the router and all its groups |
| `'group'` | Applied to all routes in the group it was registered on, inherited by subgroups |
| `'route'` | Applied only to the next registered route, then removed |

`'route'` is the default context when omitted.

```ts
// Applied only to the next route
router.use(authMiddleware).get('/', handler)

// Applied to all routes in the group
router.use(authMiddleware, 'group').prefix('/api/admin').group()
```

Middleware accumulates on the router. When a route is registered via `.add()`, all currently attached middleware is snapshotted onto that route and the `'route'`-scoped middleware is cleared.

### Middleware chaining and type inference

`.use()` returns a typed `Router` where the middleware's handle result is merged into the handler context type. This means you can chain `.use()` calls and the handler will receive the union of all injected properties fully typed:

```ts
const router = rootRouter
    .use(authMiddleware)   // injects ctx.user
    .prefix('/api/users')
    .group()

router.get('/', async (ctx) => {
    ctx.user  // typed from authMiddleware
    ctx.acl   // typed from authorizationMiddleware (global)
})
```

---

## Groups

`.group()` creates a child `Router` instance that inherits the parent's active prefixes and middleware (converted to `'group'` scope). Routes registered on the child are flattened into the parent's route list via `.list()`.

This is the standard pattern for route files:

```ts
// server/routes/users.route.ts
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'

const router = rootRouter
    .use(authMiddleware)     // will apply to all routes in this group
    .prefix('/api/users')
    .group()

router.get('/', handler)       // → GET /api/users/
router.get('/:id', handler)    // → GET /api/users/:id
router.delete('/:id', handler) // → DELETE /api/users/:id
```

Groups allow route files to define their own prefix and middleware without affecting the global router state.

---

## Route Resolution and Execution

### Resolution

`router.resolve(method, path)` searches all registered routes (including groups) for the first match. It returns the `Route` instance or `null`.

Path matching rules:
- Static segments must match exactly
- `:param` segments match any single segment
- `*` matches everything from that point on
- Trailing segments with no route match → no match

### Execution

`router.execute(route, initialCtx)` runs the middleware pipeline for the matched route, then calls the handler.

For each middleware in order:
1. `middleware.handle(ctx)` is called
2. If the result contains a `redirect` key, the chain stops and the redirect is returned immediately
3. Otherwise, the result is merged into `ctx` for the next middleware

After all middleware, `route.handler(ctx)` is called and its return value is the final response.

```ts
// Conceptually:
for (const middleware of route.middlewares) {
    const result = await middleware.handle(ctx)

    if (result?.redirect) return result  // short-circuit

    Object.assign(ctx, result)           // merge into ctx
}

return route.handler(ctx)
```

---

## RouterRegister

`RouterRegister` extends `RouterService` with file/directory scanning.

### `addFile(filepath, metadata?)`

Registers a single file to be imported on `load()`. Metadata is merged into each route's `route.metadata`.

### `addDir(dirpath, metadata?)`

Registers a directory. On `load()`, every non-test file inside it is imported.

### `load()`

Iterates all registered files and directories and dynamically imports them. Each file's top-level side effects (i.e., the route definitions) run against the shared router instance. Failed imports are logged but do not halt the load.

A cache-busting query string (`?t=timestamp`) is added to each import path to prevent Node's module cache from returning a stale module on hot-reloads.
