import { sql } from 'kysely'
import { search } from '@inquirer/prompts'
import arte from '#server/facades/arte.facade.ts'
import db from '#server/facades/db.facade.ts'
import cli from '#server/services/cli.service.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

interface TableListOptions {
    table?: string
    limit?: number
    offset?: number
    sort?: string
    where?: string
}

arte
    .command('sql:select')
    .need('db')
    .description('List rows from a database table')
    .helpGroup('sql')
    .option('-t, --table <table>', 'Table name')
    .option('-l, --limit <limit>', 'Maximum number of rows to return', (value) => parseInt(value))
    .option('-o, --offset <offset>', 'Number of rows to skip', (value) => parseInt(value))
    .option('-s, --sort <sort>', 'Sort by')
    .option('-w, --where <where>', 'Where conditions as key=value pairs (e.g., "name=John&age=25")')
    .action(async (options: TableListOptions) => {
        await db.load()

        let table = options.table

        if (!table) {
            const tables = await db.introspection.getTables()
            const tableNames = tables.map(t => t.name)

            table = await search({
                message: 'Select a table',
                source: (input) => {
                    const filtered = input
                        ? tableNames.filter(t => t.toLowerCase().includes(input.toLowerCase()))
                        : tableNames

                    return filtered.map(t => ({
                        name: t,
                        value: t 
                    }))
                },
            })
        }

        let query = `SELECT * FROM ${table}`

        if (options.where) {
            query += ` WHERE ${options.where}`
        }

        if (options.sort) {
            query += ` ORDER BY ${options.sort}`
        }

        query += ` LIMIT ${options.limit || 10}`

        if (options.offset) {
            query += ` OFFSET ${options.offset}`
        }

        console.log(`Executing query: ${query}`)

        const [error, response] = await tryCatch(async () => {
            const result = await sql.raw(query).execute(db)

            await db.destroy()

            return result
        })

        if (error) {
            console.log(`No rows found in table "${table}"`)
            return
        }

        const rows = response.rows as Record<string, any>[]

        cli.ui.table(rows)
    })
