import { program } from 'commander'
import Permission from '#shared/entities/permission.entity.ts'
import cli from '#server/services/cli.service.ts'
import { list } from '#server/queries/list.ts'
import db from '#server/facades/db.facade.ts'

program.command('permission:list')
    .helpGroup('permission')
    .description('Assign a permission to a user')
    .option('-t, --type <type>', 'Assignable type (user, role)')
    .option('-i, --id <id>', 'Assignable ID')
    .action(async (options) => {
        await db.load()

        const { type, id } = options

        const permissions = await list('permissions', {
            serialize: Permission.from,
            query: (qb) => {
                let query = qb.selectAll()

                if (type){
                    query = query.where('id', 'in', (eb) =>
                        eb.selectFrom('permissions_assignments')
                            .select('permission_id')
                            .where('assignable_type', '=', type)
                    )
                }

                if (id){
                    query = query.where('id', 'in', (eb) =>
                        eb.selectFrom('permissions_assignments')
                            .select('permission_id')
                            .where('assignable_id', '=', id.toString())
                    )
                }

                return query
            }
        })

        cli.ui.table(permissions)

        await db.destroy()
    })
