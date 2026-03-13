# Migrations

The migration system is built on top of [Kysely](https://kysely.dev/) and is file-driven. Each migration is a plain TypeScript file with an `up` and `down` function. The `migrations` table tracks which migrations have been executed and is created automatically on first run.

Core migrations live in `server/migrations/`. Module migrations follow the same format but live inside each module's own directory — see [Module Migrations](/modules/server/migrations) for details.

## App Setup

Core migrations are automatically run as part of the **app setup flow**. When the database is configured through the setup wizard, the server calls `migrator.latest({ root: true })` internally — no manual step required for a fresh install.

After the initial setup is complete, use the CLI to manage migrations going forward.

## Running Migrations

Use the `-r` / `--root` flag to scope commands to core-only migrations:

```bash
# Check migration statuses
node arte migration:status --root

# Run all pending core migrations
node arte migration:latest --root

# Run one step at a time
node arte migration:up --root

# Rollback the last migration
node arte migration:down --root

# Rollback all then re-run
node arte migration:fresh --root
```

Omitting `--root` and `-m` will operate on **all** migrations (core + every enabled module).

## Creating a Migration

```bash
node arte migration:make create_table_items
```

This scaffolds a new file inside `server/migrations/`:

```
server/migrations/2026_01_01_00_00_create_table_items.ts
```

Files are named with a timestamp prefix so they always execute in creation order.

## Migration File Structure

```ts
import { Kysely } from 'kysely'

const table = 'items'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('name', 'varchar(255)', col => col.notNull())
        .addColumn('description', 'text')
        .addTimestampColumns()
        .addSoftDeleteColumn()
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}
```

Core tables do **not** require a prefix — unlike module tables, they own the namespace.

## The Database Contract

After adding a migration, declare the table shape in `server/contracts/database.contract.ts` so Kysely can provide full type inference across the application.

```ts
// server/contracts/database.contract.ts
import type { Generated, ColumnType } from 'kysely'
import type { TimestampTable, SoftDeleteTable } from '#server/queries/index.ts'

export interface ItemsTable extends TimestampTable, SoftDeleteTable {
    id: Generated<number>
    name: string
    description: string | null
}

export interface Database {
    // ... existing tables
    items: ItemsTable
}
```

Once declared, the table is available everywhere `db` is used with complete type safety:

```ts
import db from '#server/facades/db.facade.ts'

const items = await db.selectFrom('items')
    .selectAll()
    .execute()
// items is typed as ItemsTable[]
```

## Lifecycle Events

`MigratorService` emits events before and after each operation. Register listeners in a hook if you need to react to migrations:

| Event | Fired |
|---|---|
| `migrator:before-migrate` | Before running any `up` |
| `migrator:after-migrate` | After all `up` functions complete |
| `migrator:before-rollback` | Before running any `down` |
| `migrator:after-rollback` | After all `down` functions complete |

## MigratorService API

The migrator is available via `server/facades/migrator.facade.ts`. The main methods are:

| Method | Description |
|---|---|
| `list(filters?)` | List all migrations with their execution status |
| `latest(filters?)` | Run all pending migrations |
| `up(steps, filters?)` | Run N pending migrations |
| `down(steps, filters?)` | Rollback N executed migrations |
| `migrate(filters?, steps?)` | Run pending migrations up to N steps |
| `rollback(filters?, steps?)` | Rollback executed migrations |
| `fresh(filters?, steps?)` | Rollback all then re-run |

All methods accept a `filters` object. Pass `{ root: true }` to target only core migrations, or `{ module: 'name' }` to target a specific module.
