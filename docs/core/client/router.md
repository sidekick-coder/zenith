# Router 

The client router is built on top of [Vue Router](https://router.vuejs.org/) and extends it with file-based route auto-loading (`router.auto`). It is registered into the DI container during the lifecycle and exposed via a facade for convenient use anywhere in the app.

## Lifecycle

The router is managed by `client/hooks/router.hook.ts`, which wires it up across the three lifecycle phases:

### `onRegister`

A new router instance is created and stored in the DI container under the key `'router'`:

```ts
const router = createRouter()
di.set('router', router)
```

### `onLoad`

Routes are added to the router. Three route groups are registered using `router.auto`, and two manual redirects are defined:

```ts
// Admin pages — require authentication
router.auto(import.meta.glob('../pages/admin/**/*.vue'), {
    strip: ['pages'],
    guards: [authGuard],
})

// Auth pages — only for guests
router.auto(import.meta.glob('../pages/auth/**/*.vue'), {
    strip: ['pages'],
    guards: [guestGuard],
})

// Public pages — exclude admin and auth directories
router.auto(import.meta.glob('../pages/**/*.vue'), {
    strip: ['pages'],
    exclude: ['/admin', '/auth'],
})

router.addRoute({ path: '/admin', redirect: '/admin/users' })
router.addRoute({ path: '/admin/settings', redirect: '/admin/settings/auth/layout' })
```

### `onBoot`

The home route alias and the 404 catch-all are added, then the router is attached to the Vue app:

```ts
// Alias '/' to whatever `site.home_route_path` is configured to
const homeRoute = config.get('site.home_route_path', '/hello')
router.addRoute({ ...record, path: '/', name: 'home' })

// Catch-all 404
router.addRoute({
    path: '/:pathMatch(.*)*',
    component: () => import('../pages/errors/404.vue'),
})

app.use(router)
```

The home route is resolved dynamically so that any installed module can claim the `/` path by setting `site.home_route_path` in the config.

---

## `router.auto` — file-based route loading

`router.auto` is a helper method added to the router instance. It converts a Vite `import.meta.glob` map of `.vue` files into Vue Router route records and adds them automatically.

```ts
router.auto(imports, options?)
```

### Path derivation

For each file path in the glob map the following transformations are applied:

1. `.vue` extension is stripped.
2. The path is split into segments.
3. Segments wrapped in `[brackets]` are converted to Vue Router dynamic params (`:param`).
4. Segments matching `strip` rules are removed.
5. Remaining segments are joined with `/`.
6. A trailing `index` segment is removed (making it the index route of that directory).
7. An optional `prefix` is prepended.
8. The path is normalised to always start with `/` and never end with `/`.

**Examples:**

| File | Options | Path |
|---|---|---|
| `pages/admin/users/index.vue` | `strip: ['pages']` | `/admin/users` |
| `pages/admin/users/[id].vue` | `strip: ['pages']` | `/admin/users/:id` |
| `pages/auth/login.vue` | `strip: ['pages']` | `/auth/login` |
| `pages/settings.vue` | `strip: ['pages'], prefix: '/app'` | `/app/settings` |

### Options

| Option | Type | Description |
|---|---|---|
| `strip` | `(string \| RegExp)[]` | Path segments to remove (e.g. the `pages` directory name). |
| `exclude` | `(string \| RegExp)[]` | File paths to skip entirely. |
| `prefix` | `string` | Prepended to every generated path. Useful to namespace module routes. |
| `guards` | `NavigationGuard[] \| ((record) => NavigationGuard[])` | Guards attached as `beforeEnter` on every generated route. Pass a function to derive guards per route. |
| `refine` | `(records) => records` | Final callback to modify the full list of generated records before they are added. |

---

## Guards

Guards are Vue Router navigation guards that control access to routes.

### `setupGuard`

Applied globally via `router.beforeEach`. It enforces the initial setup wizard flow:

- If setup is **complete** and the user is navigating to `/setup/*`, redirects to `/`.
- If setup is **incomplete** and the user is navigating anywhere outside `/setup/*`, redirects to `/setup`.
- Within `/setup`, it enforces the correct step order: `/setup/database` must be completed before `/setup/user`.

### `authGuard`

Applied as `beforeEnter` on the `/admin/**` routes. Redirects unauthenticated users to `/auth/login`.

```ts
import authGuard from '#client/guards/auth.guard.ts'

router.auto(import.meta.glob('./pages/admin/**/*.vue'), {
    strip: ['pages', 'admin'],
    prefix: '/admin/my-module',
    guards: [authGuard],
})
```

You can also create a customised variant with `createAuthGuard`:

```ts
import { createAuthGuard } from '#client/guards/auth.guard.ts'

const guard = createAuthGuard({
    redirect: '/auth/login',
    exclude: ['/auth/login', '/auth/register'],
})
```

### `guestGuard`

Applied as `beforeEnter` on the `/auth/**` routes. Redirects authenticated users away to `/`.

```ts
import { createGuestGuard } from '#client/guards/guest.guard.ts'

const guard = createGuestGuard({ redirect: '/' })
```

---

## Facade

The router facade exposes the DI-registered instance as a lazy proxy, making it importable at the module level without worrying about registration order:

```ts
// client/facades/router.facade.ts
import di from '#client/utils/di.ts'
import type { Router } from '#client/router.ts'

const router = di.proxy<Router>('router')
export default router
```

Use it anywhere in the app:

```ts
import router from '#client/facades/router.facade.ts'

router.push('/dashboard')
router.replace({ path: '/profile', query: { tab: 'settings' } })
```

