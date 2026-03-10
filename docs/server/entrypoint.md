# Server Entrypoint

To extend the server side your module can use a special entrypoint file located at `server/module.server.ts` in your module directory.

## Module server file

This is the entrypoint between the server and your module, and you can use to hook into the server lifecycle and execute code on each phase.

```ts
// modules/my-module/server/module.server.ts
import Module from '#server/entities/module.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class MyModule extends composeWith(
    Module, 
    Lifecycle
) {

    public async onRegister(): Promise<void> {
        // register services here
    }

    public async onLoad(): Promise<void> {
        // services and dependencies are loaded here
    }

    public async onBoot(): Promise<void> {
        // application is booted and started here
    }

    public async onShutdown(): Promise<void> {
        // application is shutting down here
    }
}

```

## Hooks folder

Also, all files in the `server/hooks` directory will be loaded too so you can split your lifecycle hooks in multiple files if needed to organize your code better.

```- module
|-- server
    |-- module.server.ts
    |-- hooks
        |-- router.hook.ts
        |-- scheduler.hook.ts
        |-- jobs.hook.ts
```
