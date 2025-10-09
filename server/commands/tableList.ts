import { program } from 'commander'
import { sql } from 'kysely'
import db from '#server/facades/db.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import cli from '#server/services/cli.service.ts'


program.command('table:list')
    .description('List all tables in the database')
    .helpGroup('table')
    .action(async () => {
        const [error, response] = await tryCatch(async () => {
            await db.load()

            const result = await db.introspection.getTables()

            await db.destroy()

            return result
        })

        if (error) {
            console.log('Error executing query:', error)
            return
        }

        const items = response.map(r => ({
            name: r.name,
            columns: r.columns.map(c => c.name).join(', '),
        }))

        cli.ui.table(items)
    })
