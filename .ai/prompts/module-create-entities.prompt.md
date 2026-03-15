---
description: Create shared, server, and client entity files for a module.
argument-hint: "module name, entity name(s), and optionally a migration file path"
---

Create entity files for a module across the three contexts: shared, server, and client.

## Inputs

- **Module name** — e.g. `walletio`
- **Entity name(s)** — one or more PascalCase names, e.g. `Wallet`, `Transaction`
- **Migration file (optional)** — path to a migration file under `modules/$module/server/migrations/`. When provided, read it and derive the entity's public properties from its columns.

## Steps

1. If a migration file path was provided, read it and extract column definitions using the type mapping rules below to determine each property's name and TypeScript type.
2. For each entity name, create three files:
   - `modules/$module/shared/entities/<name>.entity.ts`
   - `modules/$module/server/entities/<name>.entity.ts`
   - `modules/$module/client/entities/<name>.entity.ts`
3. Use camelCase for the filename (e.g. `WalletTransaction` → `walletTransaction.entity.ts`).

## Type mapping rules (migration → shared entity property)

| Migration call | TypeScript type | Notes |
|---|---|---|
| `.addIdColumn()` | `public id: number` | always present; do not add if already listed |
| `.addTimestampColumns()` / `.addCreatedColumn()` | compose `Timestamp` mixin | adds `created_at` / `updated_at` |
| `.addSoftDeleteColumn()` | compose `SoftDelete` mixin | adds `deleted_at` |
| `addColumn('x', 'varchar' \| 'text', col => col.notNull())` | `public x: string` | |
| `addColumn('x', 'varchar' \| 'text')` | `public x: string \| null` | nullable |
| `addColumn('x', 'integer' \| 'bigint', col => col.notNull())` | `public x: number` | |
| `addColumn('x', 'integer' \| 'bigint')` | `public x: number \| null` | nullable |
| `addColumn('x', 'boolean', col => col.notNull())` | `public x: boolean` | |
| `addColumn('x', 'boolean')` | `public x: boolean \| null` | nullable |
| `addColumn('x', 'timestamp', col => col.notNull())` | `public x: Date \| string` | |
| `addColumn('x', 'timestamp')` | `public x: Date \| string \| null` | nullable |
| `addColumn('x', 'decimal' \| 'float' \| 'numeric', col => col.notNull())` | `public x: number` | |
| `addColumn('x', 'decimal' \| 'float' \| 'numeric')` | `public x: number \| null` | nullable |
| `addColumn('x', 'json' \| 'jsonb', col => col.notNull())` | `public x: Record<string, any>` | |
| `addColumn('x', 'json' \| 'jsonb')` | `public x: Record<string, any> \| null` | nullable |

## Output format

### Shared entity

```ts
// modules/$module/shared/entities/<name>.entity.ts
import { BaseEntity, Timestamp, SoftDelete } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class ExampleName extends compose(BaseEntity, Timestamp, SoftDelete) {
    public id: number
    public user_id: number
    public title: string
    public description: string | null
}
```

- Only compose `Timestamp` if the migration uses `.addTimestampColumns()` or `.addCreatedColumn()`.
- Only compose `SoftDelete` if the migration uses `.addSoftDeleteColumn()`.
- If no migration was provided, include `public id: number` and leave a comment `// add properties here`.

### Server entity

```ts
// modules/$module/server/entities/<name>.entity.ts
import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#$module/shared/entities/<name>.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class ExampleName extends composeWith(Base, Model('$module__example_names')) {
    // server-specific methods or computed properties can be added here
}
```

- Table name is the module-prefixed snake_case plural of the entity name (e.g. `walletio__wallets`).
- Include `HooksStatic` before `Model` only when there is an obvious need (e.g. password hashing, slug generation). Otherwise omit it and let the developer add it later.

### Client entity

```ts
// modules/$module/client/entities/<name>.entity.ts
import Base from '#$module/shared/entities/<name>.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class ExampleName extends composeWith(Base) {
    // add UI-specific computed properties here
}
```

- Keep it minimal. Only add display helpers if they are obviously derivable from the shared entity (e.g. a `displayName` from `id` + `name`, or a `statusColor` map if a `status` field is present).

## Rules

- Do not use `try/catch` blocks.
- Do not use `else` — prefer early returns or separate `if` blocks.
- Columns covered by mixins (`id`, `created_at`, `updated_at`, `deleted_at`) must **not** be redeclared in the shared entity.
- Use `import type` for relation fields (e.g. `import type Wallet from './wallet.entity.ts'`).
- If any of the three files already exists, replace it entirely.
- After generating the files, print a short summary listing each file path created/updated.
