import { program } from 'commander'
import { sql } from 'kysely'
import db from '#server/facades/db.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

program.command('sql:insert')
    .arguments('<table>')
    .description('Insert rows into a database table')
    .helpGroup('sql')
    .option('-v, --values <values>', 'Insert values as key=value pairs (e.g., "name=John age=25")')
    .action(async (table: string, options: { values?: string }) => {
        if (!table) {
            console.error('Table name is required')
            return
        }

        if (!options.values) {
            console.error('Values are required for insert operation')
            return
        }

        // Parse the values from space-separated format (column=value column2=value2)
        const parsedValues: Record<string, string> = {}
        const pairs = options.values.split(' ')
        
        for (const pair of pairs) {
            const [key, value] = pair.split('=')
            if (key && value !== undefined) {
                parsedValues[key] = value
            }
        }

        if (Object.keys(parsedValues).length === 0) {
            console.error('No valid key=value pairs found in values')
            return
        }

        const columns = Object.keys(parsedValues).join(', ')
        const values = Object.values(parsedValues)
            .map(v => `'${v}'`)
            .join(', ')
        const query = `INSERT INTO ${table} (${columns}) VALUES (${values})`

        console.log(`Executing query: ${query}`)

        const [error, response] = await tryCatch(async () => {
            await db.load()

            return sql.raw(query).execute(db)
        })

        if (error) {
            console.log(`Error inserting into table "${table}":`, error)
            return
        }

        console.log('Insert successful:', response)
    })