import { program } from 'commander'
import { sql } from 'kysely'
import qs from 'qs'
import db from '#server/facades/db.facade.ts'
import cli from '#server/services/cli.service.ts'

interface TableListOptions {
    limit?: number
    offset?: number
    sort?: string
    where?: string
}

program.command('rows:list')
    .arguments('<table>')
    .description('List rows from a database table')
    .helpGroup('rows')
    .option('-l, --limit <limit>', 'Maximum number of rows to return', (value) => parseInt(value))
    .option('-o, --offset <offset>', 'Number of rows to skip', (value) => parseInt(value))
    .option('-s, --sort <sort>', 'Sort by column (use +column for ASC, -column for DESC)')
    .option('-w, --where <where>', 'Where conditions as key=value pairs (e.g., "name=John&age=25")')
    .action(async (table: string, options: TableListOptions) => {
        if (!table) {
            console.error('Table name is required')
            return
        }

        // Build the SQL query parts
        let whereClause = ''
        let orderClause = ''
        let limitClause = ''
        
        // Apply where conditions  
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
        }

        // Apply sorting
        if (options.sort) {
            const sortColumns = options.sort.split(',')
            const orderParts: string[] = []
            
            sortColumns.forEach(sortColumn => {
                const trimmed = sortColumn.trim()
                
                if (trimmed.startsWith('-')) {
                    const column = trimmed.slice(1)
                    orderParts.push(`${column} DESC`)
                } else if (trimmed.startsWith('+')) {
                    const column = trimmed.slice(1)
                    orderParts.push(`${column} ASC`)
                } else {
                    orderParts.push(`${trimmed} ASC`)
                }
            })
            
            if (orderParts.length > 0) {
                orderClause = ` ORDER BY ${orderParts.join(', ')}`
            }
        }

        // Apply limit and offset
        if (options.limit && options.limit > 0) {
            limitClause += ` LIMIT ${options.limit}`
        }
        if (options.offset && options.offset > 0) {
            limitClause += ` OFFSET ${options.offset}`
        }

        let rows: any[] = []

        try {
            const result = await sql`SELECT * FROM ${sql.id(table)}${sql.raw(whereClause)}${sql.raw(orderClause)}${sql.raw(limitClause)}`.execute(db)
            rows = result.rows as any[]
        } catch (error) {
            console.error(`Error querying table "${table}":`, error)
            return
        }

        if (rows.length === 0) {
            console.log(`No rows found in table "${table}"`)
            return
        }

        // Display the results using CLI service
        cli.ui.table(rows)

        // Show query summary
        console.log(`\nShowing ${rows.length} row(s) from table "${table}"`)
        if (options.limit || options.offset) {
            console.log(`Query options: ${options.limit ? `limit=${options.limit}` : ''} ${options.offset ? `offset=${options.offset}` : ''}`)
        }
    })
