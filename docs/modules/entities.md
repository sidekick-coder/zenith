# Entities

Entities are classes that represent your data models. Zenith uses a layered approach: a **shared entity** lives in `shared/` and is available on both client and server, while a **server entity** extends it with database-specific behavior like query relations.

This separation ensures your type definitions stay consistent across the stack without leaking server-only dependencies to the client.

## Shared Entity

Create a base entity in your module's `shared/entities/` directory. Extend `BaseEntity` and optionally compose it with mixins like `Timestamp` or `SoftDelete` from `#shared/mixins`:

```ts
// shared/entities/mymodule_item.entity.ts
import { BaseEntity, Timestamp, SoftDelete } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class MyModuleItem extends compose(BaseEntity, Timestamp, SoftDelete) {
    public id: number
    public name: string
    public description: string
}
```

The `BaseEntity` mixin provides two helpers:

- **`from(data)`** — creates an instance from a plain object, useful for hydrating API responses on the client
- **`merge(data)`** — updates the instance with new data in place

## Available Mixins

| Mixin | Fields added |
|---|---|
| `Timestamp` | `created_at`, `updated_at` |
| `SoftDelete` | `deleted_at` |

## Server Entity

In `server/entities/`, extend your shared entity and add database bindings using `Model` and `Relation`:

```ts
// server/entities/mymodule_item.entity.ts
import { Model } from '#server/mixins/model.mixin.ts'
import { composeWith } from '#shared/utils/compose.ts'
import BaseMyModuleItem from '#mymodule/shared/entities/mymodule_item.entity.ts'

export default class MyModuleItem extends composeWith(
    BaseMyModuleItem,
    Model('mymodule_items')
) {}
```

The `Model` mixin binds the entity to a database table and provides query capabilities on the server side.

## Using on the Client

Since the shared entity is available on both sides, you can use `from()` to hydrate data returned from the API:

```ts
import MyModuleItem from '#mymodule/shared/entities/mymodule_item.entity.ts'

const item = MyModuleItem.from(apiResponse)

console.log(item.name)
```

This gives you full type safety in your Vue components without any server-only code being included in the client bundle.

## Client Entity

If you need client-specific logic (e.g. computed display properties, UI state), you can create an entity in `client/entities/` that extends the shared one:

```ts
// client/entities/mymodule_item.entity.ts
import BaseMyModuleItem from '#mymodule/shared/entities/mymodule_item.entity.ts'

export default class MyModuleItem extends BaseMyModuleItem {
    public get label(): string {
        return `[${this.id}] ${this.name}`
    }
}
```

> In most cases the shared entity is already enough. Only reach for a client entity when you have logic that truly belongs to the UI layer.
