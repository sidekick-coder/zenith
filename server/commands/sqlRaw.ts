import path from 'path'
import fs from 'fs'
import { program } from 'commander'
import { sql } from 'kysely'
import db from '#server/facades/db.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import cli from '#server/services/cli.service.ts'
import logger from '#server/facades/logger.facade.ts'


program.command('sql:raw')
    .description('Execute a raw SQL query')
    .helpGroup('sql')
    .option('-q, --query <query>', 'The raw SQL query to execute')
    .option('-f, --file <file>', 'Path to a file containing the SQL query')
    .action( cli.with(['db'], async (options) => {
        let query: string = options.query || ''

        if (options.file) {
            const filename = path.resolve(process.cwd(), options.file)
            query = await fs.promises.readFile(filename, 'utf-8')
        }

        const statements = query.trim().split(';')
            .filter(s => s.trim().length > 0)

        for (const stmt of statements) {
            logger.info('Executing query:', stmt)

            const [error, response] = await tryCatch(() => sql.raw(stmt).execute(db))
            
            if (error) {
                logger.error('Error executing query:', error)
                return
            }

            if (response.rows && response.rows.length > 0) {
                console.log(response.rows)
            }
        }

    }))
