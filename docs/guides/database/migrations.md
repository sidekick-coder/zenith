# Migrations

Migrations are a way to change the database and keep track of those changes. 

Plugins can add migrations adding files to a `src/server/migrations` folder.

Example:
```
myplugin/
├── src/
│   ├── server/
│   │   ├── migrations/
│   │   │   ├── 001-create-items-table.ts
│   │   │   ├── 002-create-tags-table.ts
```

You can name the files with a prefix number to indicate the order of the migrations, or use any naming convention you prefer.

Just keep in mind that the order of the files will determine the order of the migrations, so if you have dependencies between them, make sure to name them accordingly.

## Migration file

A migration file should export two functions: `up` and `down`.

They receive a `Kysely` instance as a parameter, which you can use to execute SQL queries to modify the database schema.

```ts
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('items')
        .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
        .addColumn('name', 'varchar(255)', col => col.notNull())
        .addColumn('description', 'text', col => col)
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('items').execute()
}
```
