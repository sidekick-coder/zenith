# Setup

Client setup files are the entrypoint your module can use to extend the client side of the application.

The are executed every time the client is started and only when your module is enabled.

The can do things like:

- Add client routes
- Add menu items
- Add global components
- Add plugins
- etc..

Use it to configure the client side of your module.
```ts
// client/setup.client.ts
import { defineClientSetup } from '#client/utils/defineClientSetup.ts'

export default defineClientSetup(async (ctx) => {
    // execute
})
```

## Loaded files

By default the client setup file is located at `client/setup.client.ts` in your module directory if it exists.

And also all files in the `client/setup` directory will be loaded too so you can split your setup in multiple files if needed.
```
- module
|-- client
    |-- setup.client.ts
    |-- setup
        |-- routes.ts
        |-- menu.ts
        |-- components.ts
```

