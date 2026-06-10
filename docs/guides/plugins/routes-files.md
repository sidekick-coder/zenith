# Route files

This are files that are used to dynamically register routes, they are imported when loading the router.

They used mainly to organize routes in separate files, for example by resource or domain. They can also be used to create route groups with their own prefixes and middleware.

To register route files, use the `RouterRegister` methods in the `onLoad` lifecycle phase of `server/hooks/router.hook.ts`:
```ts 
// myplugin/src/server/index.ts
import { router, PluginEntity, RouterRegister, RouterService } from '@sidekick-coder/zenith/server';

export default class extends PluginEntity {
    public async load() {
        const router = container.get<RouterRegister>(RouterService)

        router.addFile(this.makePath('routes', 'orders.route.ts'))

        // or register a whole directory
        router.addDir(this.makePath('routes')
    }
}
```

Then you can define your routes in the registered files. 


```ts
// server/routes/orders.route.ts
import { router } from '@sidekick-coder/zenith/server';

const group = router.prefix('/api/orders').group()

group.get('/', handler)       // GET /api/orders/
group.get('/:id', handler)    // GET /api/orders/:id
group.post('/', handler)      // POST /api/orders/
group.put('/:id', handler)    // PUT /api/orders/:id
group.delete('/:id', handler) // DELETE /api/orders/:id
```

