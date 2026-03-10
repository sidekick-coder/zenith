# Setup

Server setup files are the entrypoint your module can use to extend the server side of the application.

The are executed every time the server   is started and only when your module is enabled.

The can do things like:

- Add server routes
- Register routines to the scheduler
- Register jobs to the queue system
- Register events
- Register assets to be added to the client side
- etc..

Use it to configure the server side of your module.
```ts
// server/setup.server.ts
import { defineServerSetup } from '#server/utils/defineServerSetup.ts'

export default defineServerSetup(async (ctx) => {
    // execute
})
```

## Loaded files

By default the server setup file is located at `server/setup.server.ts` in your module directory if it exists.

And also all files in the `server/setup` directory will be loaded too so you can split your setup in multiple files if needed.
```
- module
|-- server
    |-- setup.server.ts
    |-- setup
        |-- routesSetup.ts
        |-- routinesSetup.ts
        |-- eventsSetup.ts
```
