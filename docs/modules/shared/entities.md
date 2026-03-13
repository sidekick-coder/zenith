# Shared Entities

Shared entities live in `mymodule/shared/entities/` and are the **single source of truth** for your module's data models. They define fields, types, and computed properties once and are reused across the entire stack without any framework or database dependencies.

A shared entity acts as a **base class** that both the server and client extend for their own context:

- **[Server entities](/modules/server/entities)** extend it with database bindings, query methods, lifecycle hooks, and relations.
- **[Client entities](/modules/client/entities)** extend it with UI-specific computed properties and display logic.

## Creating a Shared Entity

Place the file in `mymodule/shared/entities/` using the naming convention `<name>.entity.ts`.

Extend `BaseEntity` and optionally compose additional mixins:

```ts
// mymodule/shared/entities/item.entity.ts
import { BaseEntity, Timestamp, SoftDelete } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class Item extends compose(BaseEntity, Timestamp, SoftDelete) {
    public id: number
    public name: string
    public description: string
}
```

## BaseEntity

`BaseEntity` is the foundation mixin. It adds two helpers:

| Method | Description |
|---|---|
| `Entity.from(data)` | Creates a new instance from a plain object. |
| `instance.merge(data)` | Updates the instance in place with partial data. |

## Available Mixins

| Mixin | Fields added |
|---|---|
| `BaseEntity` | `from()`, `merge()` |
| `Timestamp` | `created_at`, `updated_at` |
| `SoftDelete` | `deleted_at` |

All mixins are imported from `#shared/mixins/index.ts` and composed with the `compose` utility from `#shared/utils/compose.ts`. Order matters — mixins are applied left to right.

## Referencing Other Shared Entities

Use `import type` for relation fields. This keeps the shared entity lightweight and avoids circular dependency issues:

```ts
import type Permission from './permission.entity.ts'
import type Role from './role.entity.ts'
```
