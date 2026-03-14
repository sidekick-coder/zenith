---
description: Generate or update the database contract for a module based on its migrations.
argument-hint: "module name"
---

Read all migration files in `modules/$module/server/migrations/` and generate or update `modules/$module/server/contracts/database.contract.ts` to reflect the current database schema.

## Steps

1. Read every migration file under `modules/$module/server/migrations/` in chronological order (files are named `YYYY_MM_DD_HH_MM_<description>.ts`).
2. Track all `createTable`, `alterTable` (addColumn / dropColumn / alterColumn), and `dropTable` calls to determine the final schema.
3. Generate a TypeScript interface for each surviving table and a `Database` map that registers them.
4. Write the result to `modules/$module/server/contracts/database.contract.ts`.

## Type mapping rules

| Migration call | TypeScript type | Notes |
|---|---|---|
| `.addIdColumn()` | `id: Generated<number>` | auto-increment primary key |
| `.addTimestampColumns()` | extend `TimestampTable` | adds `created_at` / `updated_at` |
| `.addCreatedColumn()` | extend `TimestampTable` | adds `created_at` only |
| `.addSoftDeleteColumn()` | extend `SoftDeleteTable` | adds `deleted_at` |
| `addColumn('x', 'varchar' \| 'text', col => col.notNull())` | `x: string` | |
| `addColumn('x', 'varchar' \| 'text')` | `x: string \| null` | no `.notNull()` |
| `addColumn('x', 'integer', col => col.notNull())` | `x: number` | |
| `addColumn('x', 'integer')` | `x: number \| null` | |
| `addColumn('x', 'boolean', col => col.notNull())` | `x: boolean` | |
| `addColumn('x', 'boolean')` | `x: boolean \| null` | |
| `addColumn('x', 'timestamp', col => col.notNull())` | `x: string` | |
| `addColumn('x', 'timestamp')` | `x: string \| null` | |

## Output format

```ts
import type { Generated } from 'kysely'
import type { SoftDeleteTable, TimestampTable } from '#server/queries/index.ts'

export interface ModuleExampleTable extends TimestampTable, SoftDeleteTable {
  id: Generated<number>
  user_id: number
  name: string
  description: string | null
}

declare module '#server/contracts/database.contract' {
  export interface Database {
    module__examples: ModuleExampleTable
  }
}

export {}
```

## Rules

- Only import `Generated` from `kysely` if the table has an auto-increment id; only import `TimestampTable` / `SoftDeleteTable` if any table uses those helpers.
- Interface names should be PascalCase derived from the table name (e.g. `walletio__wallets` → `WalletioWalletsTable`).
- Do not include columns added by `addTimestampColumns` / `addSoftDeleteColumn` / `addIdColumn` explicitly — they are covered by the extended interfaces.
- If the contract file already exists, replace it entirely with the new generated content.