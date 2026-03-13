# Migrations

Modules can create their own database migrations to add new tables or modify existing ones.

::: warning Handle with care
Migrations give you direct access to modify the database structure, this is very powerful but also very dangerous. 

So be very careful when writing migration files, always test migrations in a development environment before running them in production.
:::

## Running Migrations

Migrations can be run from the **admin dashboard** or via the CLI. 

Use the `-m` flag to scope the command to your module — this avoids accidentally running or rolling back migrations from other modules:

```bash
# Check migrations statuses
node arte migration:status -m mymodule

# Run all pending migrations for your module
node arte migration:latest -m mymodule

# Run one step at a time
node arte migration:up -m mymodule

# Rollback the last migration
node arte migration:down -m mymodule
```

## Creating a Migration

Use the CLI to scaffold a migration file scoped to your module:

```bash
node arte migration:make -m mymodule create_table_mymodule_items
```

This creates a file under your module's `server/migrations/` directory:

```
modules/mymodule/server/migrations/2026_01_01_00_00_create_table_mymodule_items.ts
```

**Naming convention:** Always prefix table names with your module alias followed by `__` to avoid conflicts with other modules. For example, `mymodule__items` instead of `items`.

## Migration File Structure

```ts
import { Kysely } from 'kysely'

const table = 'mymodule__items'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('description', 'text')
        .addTimestampColumns()
        .addSoftDeleteColumn()
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}
```

## Extending the Database Contract

After creating migrations, declare your tables in a `database.contract.ts` file inside your module. Use TypeScript module augmentation to merge your tables into the global `Database` interface — this enables fully type-safe queries across the entire application.

```ts
// modules/mymodule/server/contracts/database.contract.ts
import type { Generated } from 'kysely'
import type { TimestampTable, SoftDeleteTable } from '#server/queries/index.ts'

export interface MyModuleItemsTable extends TimestampTable, SoftDeleteTable {
    id: Generated<number>
    name: string
    description: string | null
}

declare module '#server/contracts/database.contract' {
    export interface Database {
        mymodule__items: MyModuleItemsTable
    }
}
```

Once declared, your tables are available anywhere `DatabaseService` is used, with full type inference:

```ts
import db from '#server/facades/database.facade.ts'

const items = await db.selectFrom('mymodule__items')
    .selectAll()
    .execute()
// items is typed as MyModuleItemsTable[]
```
