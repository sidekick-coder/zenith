# Routes

Server routes are api endpoints that you can add to the system and execute actions in the server side, like fetching data from a database or performing server-side computations.

To add a routes you define they in the setup of modules.

```ts
// server/setup.server.ts
import path from 'path'
import { defineServerSetup } from '#server/utils/defineServerSetup.ts'

export default defineServerSetup(async ({ router }) => {
    await router.get('/hello', async () => {
        return {
            message: 'Hello, world!'
        }
    })
})


```
## Load routes from directory

Adding routes directly in the setup file is fine for small projects.

But for organization purposes you can also define your routes in separate files and load them in the server setup.

```ts
// server/setup.server.ts
import path from 'path'
import { defineServerSetup } from '#server/utils/defineServerSetup.ts'

export default defineServerSetup(async ({ router }) => {
    await router.loadDirectory(path.resolve(import.meta.dirname, 'routes'))
})
```
Then you can create route files in the `server/routes` directory.

```ts
// server/routes/hello.route.ts
import router from '#server/facades/router.facade.ts'

router.get('/hello', async () => {
    return {
        message: 'Hello, world!'
    }
})
```

## Express

The server uses [Express](https://expressjs.com/) under the hood, so you can use some of its features when defining routes, but remember that this code is also executed when render SSR pages, so keep this in mind when creating routes used in the client side.