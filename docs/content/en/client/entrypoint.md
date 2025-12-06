# Client Entrypoint

To extend the client side your module can use a special entrypoint file located at `client/module.client.ts` in your module directory.

## Module client file

This is the entrypoint between the client and your module, and you can use to hook into the client lifecycle and execute code on each phase.
```ts
// modules/my-module/client/module.client.ts
import Module from '#client/entities/module.entity.ts'
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

Also, all files in the `client/hooks` directory will be loaded too so you can split your lifecycle hooks in multiple files if needed to organize your code better.

```- module
|-- client
    |-- module.client.ts
    |-- hooks
        |-- router.hook.ts
        |-- scheduler.hook.ts
        |-- jobs.hook.ts
```
