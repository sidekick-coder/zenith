# Container 

The container is a core feature of the framework, it is responsible for managing the dependencies and injections of the application, and it is used to resolve the dependencies of the classes and functions.

You can use the container to access the services and components of the application, and to register your own services and components.

```ts
import { container } from '@sidekick-coder/zenith-kit'

container.set("message", "Hello World")

const message = container.get("message")

console.log(message) // Hello World
```

## Basic usage

All dependencies in the container are registered with a unique key, which can be a string

```ts
container.set("message", "Hello World")
```

If you want to can also use a class as a key
```ts
class MyService {}

container.set(MyService, new MyService())
```

But this may cause issues when minifying the code, since internally the container uses the class name as the key, and minification may change the class name.

To fix this you can set a `__container_entry_key ` property on the class, which will be used as the key instead of the class name.

```ts
class MyService {
    static __container_entry_key = "MyService"
}

container.set(MyService, new MyService())
```

## Proxy 

Proxies are a way to create a lazy access to a dependency, they throw an error when the dependency is not registered in the container and you try to access one property of it

```ts
const messageProxy = container.proxy<{ value: string }>("message")

console.log(messageProxy.value) // Error

container.set("message", { value: "Hello World" })

console.log(messageProxy.value) // Hello World
```

This is useful to write code that depends on a service that may not be registered yet, and to avoid having to check if the service is registered before accessing it.


