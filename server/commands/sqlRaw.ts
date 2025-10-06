import { program } from 'commander'
import { sql } from 'kysely'
import db from '#server/facades/db.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'


program.command('sql:raw')
    .description('Execute a raw SQL query')
    .helpGroup('sql')
    .arguments('<query>')
    .action(async (query: string) => {
        const [error, response] = await tryCatch(async () => {
            await db.load()

            const result = await sql.raw(query).execute(db)

            await db.destroy()

            return result
        })

        if (error) {
            console.log('Error executing query:', error)
            return
        }

        console.log(response)

    })
