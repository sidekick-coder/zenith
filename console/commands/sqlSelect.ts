import { program } from 'commander'
import { sql } from 'kysely'
import db from '#server/facades/db.facade.ts'
import cli from '#server/services/cli.service.ts'
import { tryCatch } from '#shared/tryCatch.ts'

interface TableListOptions {
    limit?: number
    offset?: number
    sort?: string
    where?: string
}

program.command('sql:select')
    .arguments('<table>')
    .description('List rows from a database table')
    .helpGroup('sql')
    .option('-l, --limit <limit>', 'Maximum number of rows to return', (value) => parseInt(value))
    .option('-o, --offset <offset>', 'Number of rows to skip', (value) => parseInt(value))
    .option('-s, --sort <sort>', 'Sort by')
    .option('-w, --where <where>', 'Where conditions as key=value pairs (e.g., "name=John&age=25")')
    .action(async (table: string, options: TableListOptions) => {
        if (!table) {
            console.error('Table name is required')
            return
        }

        let query = `SELECT * FROM ${table}`

        if (options.where) {
            query += ` WHERE ${options.where}`
        }

        if (options.sort) {
            query += ` ORDER BY ${options.sort}`
        }

        if (options.limit) {
            query += ` LIMIT ${options.limit}`
        }

        if (options.offset) {
            query += ` OFFSET ${options.offset}`
        }

        console.log(`Executing query: ${query}`)

        const [error, response] = await tryCatch(() => sql.raw(query).execute(db))

        if (error) {
            console.log(`No rows found in table "${table}"`)
            return
        }

        const rows = response.rows as Record<string, any>[]

        cli.ui.table(rows)
    })
