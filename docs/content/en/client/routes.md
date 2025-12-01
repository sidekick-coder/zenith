# Routes

Client routes are vue-router routes that you can add to the system and navigate between different pages in the client side.

To add a routes you define they in the setup of modules.

```ts
// client/setup.client.ts
import { defineClientSetup } from '#client/utils/defineClientSetup.ts'

export default defineClientSetup(({ router }) => {
    router.addRoute({
        path: '/hello',
        name: 'Hello',
        component: () => import('./pages/HelloPage.vue'),
    })
})
```

## Load routes from directory

Adding each route directly in the setup file could take some time so there are some helpers to load routes from a directory.

```ts
import { defineClientSetup } from '#client/utils/defineClientSetup.ts'

export default defineClientSetup(({ router }) => {
    router.auto(import.meta.glob<any>('./pages/admin/**/*.vue'), {
        strip: ['pages', 'admin'],
        prefix: '/admin/zpass'
    })
    
    router.auto(import.meta.glob<any>('./pages/**/*.vue'), {
        strip: ['pages'],
        exclude: ['./pages/admin/**/*.vue'],
        prefix: '/zpass'
    })
})
```

## Prefix

Since a instance can have multiple modules installed and this can lead to route conflicts, it is highly recommended to add a prefix to the routes of each module.

But since you have access to the router instance you can modify the routes by removing and/or replacing routes as you see fit.

## Guards

You can also add route guards to your routes using the `beforeEach` method of the router instance.

There is also predefined guards like the `auth` guard that you can use to protect routes that require authentication.

```ts
import authGuard from '#client/guards/auth.guard.ts'
import { defineClientSetup } from '#client/utils/defineClientSetup.ts'
import { $t } from '#shared/lang'

import './assets/css/styles.css'

export default defineClientSetup(({ router, menu }) => {
    router.auto(import.meta.glob<any>('./pages/admin/**/*.vue'), {
        strip: ['pages', 'admin'],
        prefix: '/admin/zpass',
        guards: [authGuard]
    })
    
    router.auto(import.meta.glob<any>('./pages/**/*.vue'), {
        strip: ['pages'],
        exclude: ['./pages/admin/**/*.vue'],
        prefix: '/zpass'
    })
})
```