import { confirm, select } from '@inquirer/prompts'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import db from '#server/facades/db.facade.ts'

const command = new CliCommand('table:drop')
    .need('db')
    .description('Drop a table from the database')
    .helpGroup('table')
    .option('-t, --table <table>', 'Name of the table to drop')
    .action(async (options) => {
        let table = options.table 

        if (!table) {
            const all = await db.introspection.getTables() 

            const result = await select({
                message: 'Select a table to drop',
                choices: all.map(t => ({
                    name: t.name,
                    value: t.name 
                })),
            })

            table = result

        }

        if (!table) {
            console.log('No table selected')
            return
        }

        const confirmation = await confirm({ message: `Are you sure you want to drop the table "${table}"? This action cannot be undone.`, })

        if (!confirmation) {
            console.log('Operation cancelled')
            return
        }


        const [error] = await tryCatch(async () => await db.schema.dropTable(table).execute())

        if (error) {
            console.log('Error executing query:', error)
            return
        }

        console.log(`Table ${table} dropped successfully`)

    })

export default command
