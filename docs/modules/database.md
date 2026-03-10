# Extending the Database with Modules

Modules in Zenith can extend the database to add new features and data models. Here’s how you can do it:

## Write Migrations
Create migration files in your module’s `server/migrations/` directory. These files define new tables or modify existing ones using the migration system.

Use the CLI to scaffold a new migration file:

```bash
# For a core migration
node arte migration:make create_table_mymodule_items

# For a module-specific migration
node arte migration:make create_table_mymodule_items -m mymodule
```

Run `node arte migration:make --help` to see all available options:

```
Usage: arte migration:make [options] <name>

Arguments:
  name                   Migration name

Options:
  -m, --module <module>  Module name
```

**Convention:** Prefix your table names with your module name for clarity and to avoid conflicts. For example, use `mymodule_items` instead of `items`.

Example:

```ts
// server/migrations/2026_01_01_00_00_create_table_mymodule_items.ts
import { Kysely } from 'kysely'

const table = 'mymodule_items'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('name', 'text', col => col.notNull())
        // ... more columns ...
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}
```

## Extend Database Contracts
Add or update a `database.contract.ts` in your module to declare your tables in the global `Database` interface. This enables type-safe queries:

```ts
// server/contracts/database.contract.ts
export interface Database {
    mymodule_items: MyModuleItemsTable;
    // ... other tables ...
}
```

This structure keeps your module isolated, maintainable, and fully integrated with Zenith’s database system.
