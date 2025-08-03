import { program } from 'commander'
import { sql } from 'kysely'
import qs from 'qs'
import { confirm } from '@inquirer/prompts'
import db from '#server/facades/db.facade.ts'

program.command('rows:update')
    .arguments('<table>')
    .description('Update rows in a database table')
    .helpGroup('rows')
    .option('-w, --where <where>', 'Where conditions as key=value pairs (e.g., "name=John&age=25")')
    .option('-v, --values <values>', 'Update values as key=value pairs (e.g., "name=Jane&age=30")')
    .action(async (table: string, options: { where?: string; values?: string }) => {
        if (!table) {
            console.error('Table name is required')
            return
        }
        if (!options.values) {
            console.error('Update values are required')
            return
        }

        // Build WHERE clause
        let whereClause = ''
        if (options.where) {
            const whereConditions = qs.parse(options.where)
            const conditions: string[] = []
            Object.entries(whereConditions).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    conditions.push(`${key} = '${value.replace(/'/g, '\'\'')}'`)
                }
                if (Array.isArray(value)) {
                    const valueList = value.map(v => `'${String(v).replace(/'/g, '\'\'')}'`).join(',')
                    conditions.push(`${key} IN (${valueList})`)
                }
            })
            if (conditions.length > 0) {
                whereClause = ` WHERE ${conditions.join(' AND ')}`
            }
        } else {
            // No WHERE clause, ask for confirmation
            const isConfirmmed = await confirm({
                message: 'No WHERE clause specified. This will update ALL rows in the table. Do you want to continue?',
                default: false
            })
            if (!isConfirmmed) {
                console.log('Update cancelled.')
                return
            }
        }

        // Build UPDATE clause
        const updateValues = qs.parse(options.values)
        const setParts: string[] = []
        Object.entries(updateValues).forEach((e) => {
            const key = e[0].trim()
            let value = (e as [string, string]).at(1)?.trim() || ''

            if (value === 'null') {
                value = 'NULL'
            }

            setParts.push(`${key} = ${value}`)
        })
        if (setParts.length === 0) {
            console.error('No valid update values provided')
            return
        }
        const setClause = ` SET ${setParts.join(', ')}`

        let affectedRows: any = 0
        try {
            const sqlString = `UPDATE ${table} ${setClause} ${whereClause}`
            console.log(`Executing SQL: ${sqlString}`)
            const result = await sql`${sql.raw(sqlString)}`.execute(db)
            affectedRows = result.numAffectedRows || 0
        } catch (error) {
            console.error(`Error updating table '${table}':`, error)
            return
        }

        if (affectedRows === 0) {
            console.log(`No rows updated in table '${table}'`)
            return
        }

        console.log(`Updated ${affectedRows} row(s) in table '${table}'`)
    })
