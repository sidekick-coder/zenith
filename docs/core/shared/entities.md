# Shared Entities

Shared entities live in `shared/entities/` and are the **single source of truth** for your data models. They define fields, types, and computed properties once and are reused across the entire stack without any framework or database dependencies.

A shared entity acts as a **base class** that both the server and client extend for their own context:

- **[Server entities](/modules/server/entities)** extend it with database bindings, query methods, lifecycle hooks, and relations.
- **[Client entities](/modules/client/entities)** extend it with UI-specific computed properties and display logic.

## Creating a Shared Entity

Place the file in `shared/entities/` using the naming convention `<name>.entity.ts`.

Extend `BaseEntity` and optionally compose additional mixins:

```ts
import type Permission from './permission.entity.ts'
import type Role from './role.entity.ts'
import { BaseEntity, Timestamp, SoftDelete } from '#shared/mixins/index.ts'
import { compose } from '@sidekick-coder/zenith-kit/shared/utils/compose'

export default class User extends compose(BaseEntity, Timestamp, SoftDelete) {
    public id: number
    public email: string
    public name: string
    public username: string
    public password?: string
    public verified_at?: Date | string | null

    public permissions?: Permission[]
    public roles?: Role[]

    public get initials() {
        const [firstName, secondName] = this.name.split(' ')

        if (!secondName) {
            return firstName[0].toUpperCase()
        }

        return firstName[0].toUpperCase() + secondName[0].toUpperCase()
    }
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

All mixins are imported from `#shared/mixins/index.ts` and composed with the `compose` utility from `@sidekick-coder/zenith-kit/shared/utils/compose`. Order matters — mixins are applied left to right.

## Referencing Other Shared Entities

Use `import type` for relation fields. This keeps the shared entity lightweight and avoids circular dependency issues:

```ts
import type Permission from './permission.entity.ts'
import type Role from './role.entity.ts'
```
