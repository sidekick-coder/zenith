import { CreateTableBuilder, sql } from "kysely";

export function withTimestamps(qb: CreateTableBuilder<any>): CreateTableBuilder<any> {
    return qb
        .addColumn('created_at', 'timestamp', (col) =>  col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamp', (col) =>  col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
}

export function withSoftDelete(qb: CreateTableBuilder<any>): CreateTableBuilder<any> {
    return qb.addColumn('deleted_at', 'timestamp')
}
