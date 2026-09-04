/** @typedef {import('@sidekick-coder/zenith-kit/server').DatabaseKysely} DB */

const table = ''

/**
*  @param {DB} db
 * @returns {Promise<void>}
 */
export async function up(db) {
    db.schema.createTable(table)
        .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo('CURRENT_TIMESTAMP').notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo('CURRENT_TIMESTAMP').notNull())
        .addColumn('deleted_at', 'timestamp')
        .execute()
}

/**
 * @param {DB} db
 * @returns {Promise<void>}
 */
export async function down(db) {
    await db.schema.dropTable(table).execute()
}

