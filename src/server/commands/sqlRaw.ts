import path from 'path'
import fs from 'fs'
import { sql } from 'kysely'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import db from '#server/facades/db.facade.ts'
import logger from '#server/facades/logger.facade.ts'

const command = new CliCommand('sql:raw')
    .need('db')
    .description('Execute a raw SQL query')
    .helpGroup('sql')
    .option('-q, --query <query>', 'The raw SQL query to execute')
    .option('-f, --file <file>', 'Path to a file containing the SQL query')
    .action(async (options) => {
        let query: string = options.query || ''

        if (options.file) {
            const filename = path.resolve(process.cwd(), options.file)
            query = await fs.promises.readFile(filename, 'utf-8')
        }

        const statements = query.trim().split(';')
            .filter(s => s.trim().length > 0)

        for (const stmt of statements) {
            const index = statements.indexOf(stmt) + 1
            logger.info(`Executing statement ${index} of ${statements.length}`, { statement: stmt.trim().slice(0, 100) + (stmt.length > 100 ? '...' : '') })

            const [error, response] = await tryCatch(() => sql.raw(stmt).execute(db))
            
            if (error) {
                logger.error('Error executing query:', error)
                return
            }

            if (response.rows && response.rows.length > 0) {
                console.log(response.rows)
            }
        }

    })

export default command
