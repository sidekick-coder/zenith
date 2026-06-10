# Events

App events are handle by `emmitter` service. 

The service allow to emit and listen to events throughout the application.

```ts 
import { emmitter } from '@sidekick-coder/zenith/server';

emmitter.on('user:created', ({ user }) => {
    console.log('New user created:', user);
});
```

## Listening to events 

To listen to an event, use the `emmitter.on(eventName, handler)` method. The `handler` function will receive the payload of the event as an argument.

```ts
emmitter.on('order:placed', ({ orderId, userId }) => {
    console.log(`Order ${orderId} placed by user ${userId}`);
});
```

## Emitting events 
To emit an event, use the `emmitter.emit(eventName, payload)` method. The `payload` can be any data you want to pass to the listeners.

```ts
emmitter.emit('user:created', { user: { id: 1, name: 'Alice' } });
```

## EventContract 

The `EventContract` interface is a helper to define the types of events and their payloads. It is a mapping of event names to their payload types.

But the event names are not limited to the keys of `EventContract`. 

You can emit and listen to any string event name, but using `EventContract` allows you to have type safety and autocompletion for your events.

Also you can extend the `EventContract` interface in your own code to add custom events and their payload types.

```ts
// src/server/contracts/events.ts
declare module '@sidekick-coder/zenith/server' {
    export interface EventContract {
        'order:placed': { orderId: number; userId: number };
    }
}
```
