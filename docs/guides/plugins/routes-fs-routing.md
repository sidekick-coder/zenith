# Routes using Filesystem structure 

This way to define routes allows you to use the files and folders structure to define the routes of your application.

To register the routes, you can use the `RouterFileBaseRoutingService` class when loading the plugin

```ts
// myplugin/src/server/index.ts
import { 
    RouterFileBaseRoutingService, 
    PluginEntity,
    router 
} from '@sidekick-coder/zenith/server';

export default class extends PluginEntity {
    public async load() {
        await RouterFileBaseRoutingService
            .create(this.makePath('server', 'api')) // base dir
            .setPrefix('/api')
            .setRouter(router)
            .setModule('myplugin')
            .load()
    }
}
```

Example:

```
src/server/api
    users/
        index.ts       → GET /api/users
        index.post.ts      → POST /api/users
        [id].ts        → GET /api/users/:id
        [id].put.ts      → PUT /api/users/:id
        [id].delete.ts      → DELETE /api/users/:id
```

## Handler 

Inside the files is a simple function that returns the response of the route. The function receives the http context as an argument, and can be async.

There is a helper function `defineHandler` that can be used to define the handler, but it is not required this util only adds type safety to the context argument.

```ts
// src/server/api/hello.ts
import { defineHandler } from '@sidekick-coder/zenith/server';

export default defineHandler(async (ctx) => {
    return { message: 'Hello, world!' }
})
```

## Parameters

To define a parameter, use square brackets in the file name. 

For example, `[id].ts` will match any value in that segment and make it available as `ctx.params.id`.
```ts
// src/server/api/users/[id].ts
export default defineHandler(async (ctx) => {
    const id = ctx.params.id
    // ...
})
```

Multiple parameters can be defined too 
```ts
// src/server/api/users/[id]/posts/[postId].ts
export default defineHandler(async (ctx) => {
    const userId = ctx.params.id
    const postId = ctx.params.postId
    // ...
})
```

## Methods 

To define the method of the route, add it as a suffix to the file name. The default method is `GET`.

```
src/server/api/users/index.ts       → GET /api/users
src/server/api/users/index.post.ts      → POST /api/users
src/server/api/users/[id].ts        → GET /api/users/:id
src/server/api/users/[id].put.ts      → PUT /api/users/:id
src/server/api/users/[id].delete.ts      → DELETE /api/users/:id
```
