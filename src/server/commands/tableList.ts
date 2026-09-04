import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import arte from '#server/facades/arte.facade.ts'
import db from '#server/facades/db.facade.ts'
import cli from '#server/services/cli.service.ts'

arte
    .command('table:list')
    .need('db')
    .description('List all tables in the database')
    .helpGroup('table')
    .action(async () => {
        const [error, response] = await tryCatch(async () => {
            const result = await db.introspection.getTables()

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
