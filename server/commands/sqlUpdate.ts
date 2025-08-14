import { program } from 'commander'
import { sql } from 'kysely'
import { confirm } from '@inquirer/prompts'
import db from '#server/facades/db.facade.ts'
import { tryCatch } from '#shared/tryCatch.ts'

program.command('sql:update')
    .arguments('<table>')
    .description('Update rows in a database table')
    .helpGroup('sql')
    .option('-w, --where <where>', 'Where conditions as key=value pairs (e.g., "name=John&age=25")')
    .option('-v, --values <values>', 'Update values as key=value pairs (e.g., "name=Jane&age=30")')
    .action(async (table: string, options: { where?: string; values?: string }) => {
        if (!table) {
            console.error('Table name is required')
            return
        }
       
        let query = `UPDATE ${table} SET ${options.values}`

        const confirmation = 
            options.where ?
                true :
                await confirm({ message: 'No where conditions provided. Do you want to proceed?' })  

        if (!confirmation) {
            console.log('Update operation cancelled.')
            return
        }
       
        if (options.where) {
            query += ` WHERE ${options.where}`
        }

        console.log(`Executing query: ${query}`)
       
        const [error, response] = await tryCatch(async () => {
            await db.load()

            return sql.raw(query).execute(db)
        })
       
        if (error) {
            console.log(`Error executing update on table "${table}":`, error)
            return
        }

        console.log(response)
    })
