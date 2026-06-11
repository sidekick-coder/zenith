# Config 

Config is a service to define and retrive configuration values used change behavior of the app, some usage examples are like feature flags, site colors, API keys, etc...

They are stored in a persistent storage defined by the user that can be `JSON files`, `YAML files` or a `S3 Bucket`.

```ts 
import { config } from '@sidekick-coder/zenith-kit/server'
// or for client side
import { config } from '@sidekick-coder/zenith-kit/client'
```

> The server side config is the only one that has a persistence layer, the client side is just a in-memory config instance

## Basic usage

You can get method to retrieve a config value by key, Keys support dot-notation for nested values.

```ts
const site = config.get('site') // return config/site.json content as an object
const name = site.name 
// or 
const name = config.get('site.name') // both return the same value
```

Use `set()` to create or update config values. This works on both server and client, but only the server version will persist changes.

```ts
config.set('site.name', 'Zenith') // updates site.json with { name: 'Zenith' }
```

## Custom config 

To have your own custom config file, you just need to defined a unique namespace for it, for Example `myPlugin`.

```ts
config.set('myPlugin', { chat: true, apiKey: '123' })

const chat = config.get('myPlugin.chat') // return true
const apiKey = config.get('myPlugin.apiKey') // return '123'
```

Under the hood the config service will create a `myPlugin.json` file for you

Also since the config may not be defined initially it is always recomended to pass a default value when using `get()` method to avoid problems.

```ts 
const chat = config.get('myPlugin.chat', false)
```
