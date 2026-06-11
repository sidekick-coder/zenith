# Routes 

Routes are managed by the `RouterService` that handles requests of the application

```ts
import { router } from '@sidekick-coder/zenith/server';

router.get('/api/hello', (ctx) => ({ message: 'Hello, world!' }))
```

## Registering routes

To define a route handler, use the method corresponding to the HTTP verb (`get`, `post`, `put`, `patch`, `delete`, or `many` for multiple methods). The path is relative to any active prefixes.

```ts
router.get('/api/health', (ctx) => ({ ok: true }))
router.post('/api/items', handler)
router.put('/api/items/:id', handler)
router.patch('/api/items/:id', handler)
router.delete('/api/items/:id', handler)

// register same handler for multiple methods
router.many(['GET', 'POST'], '/api/items', handler)  
```

## Path parameters 
Segments starting with `:` match any value in the request path. The matched values are available in `ctx.params`.

```ts
router.get('/users/:id', ({ params }) => {
    const id = params.id  // string
})
```

## Wildcards
A `*` segment matches everything from that point onwards.

```ts
router.get('/files/*', handler)
```
