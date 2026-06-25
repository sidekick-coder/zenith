# Scheduler 

Scheduler is a service responsible for managing and executing scheduled tasks in the app, it allows plugins to register routines that can be executed from time to time.

```ts
import { RoutineEntity, scheduler } from "@sidekick-coder/zenith-kit/server"

const routine = RoutineEntity.create()

scheduler.addAndStart(routine)
```

## Create routine 

To create a routine you just need to create an instance of the `RoutineEntity` and use the scheduler

```ts
import { RoutineEntity, scheduler } from "@sidekick-coder/zenith-kit/server"

const routine = RoutineEntity.create()
    .setId('myroutine')
    .setCron('* * * * *')
    .setHandler(() => {
         console.log('Hello word')
    })

scheduler.addAndStart(routine)
```

## Stop a routine 

You can stop a routine using the stop method with the id of the routine you created

```ts 
await scheduler.stopAndRemove("myroutine")
```
