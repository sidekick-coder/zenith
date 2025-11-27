import path from 'path'
import fs from 'fs'
import { program } from 'commander'
import { sql } from 'kysely'
import db from '#server/facades/db.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'


program.command('sql:raw')
    .description('Execute a raw SQL query')
    .helpGroup('sql')
    .option('-q, --query <query>', 'The raw SQL query to execute')
    .option('-f, --file <file>', 'Path to a file containing the SQL query')
    .action(async (options) => {
        let query = options.query

        if (options.file) {
            const filename = path.resolve(process.cwd(), options.file)
            query = await fs.promises.readFile(filename, 'utf-8')
        }

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
