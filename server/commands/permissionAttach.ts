import { program } from 'commander'
import { create } from '#server/queries/create.ts'
import Permission from '#shared/entities/permission.entity.ts'
import { find } from '#server/queries/find.ts'
import User from '#server/entities/user.entity.ts'
import cli from '#server/services/cli.service.ts'
import { findOrFail } from '#server/queries/findOrFail.ts'

program.command('permission:attach')
    .helpGroup('permission')
    .description('Add a permission to a entity')
    .requiredOption('-p, --permission-id <permissionId>', 'Permission ID')
    .requiredOption('-t, --type <type>', 'Assignable type (user, role)')
    .requiredOption('-i, --id <id>', 'Assignable ID')
    .action(async (options) => {
        const { type, id, permissionId } = options

        const permission = await find('permissions', {
            serialize: Permission.from,
            query: (qb) => qb.selectAll().where('id', '=', parseInt(permissionId, 10))
        })

        if (!permission) {
            throw new Error(`Permission with ID '${permissionId}' does not exist.`)
        }

        // if user check if user exists
        if (type === 'user') {
            await findOrFail('users', {
                query: (qb) => qb.selectAll().where('id', '=', parseInt(id, 10))
            })
        }

        // if role check if role exists
        if (type === 'role') {
            await findOrFail('roles', {
                query: (qb) => qb.selectAll().where('id', '=', parseInt(id, 10))
            })
        }

        const exists = await find('permissions_assignments', {
            query: (qb) => qb
                .selectAll()
                .where('permission_id', '=', parseInt(permissionId, 10))
                .where('assignable_type', '=', type)
                .where('assignable_id', '=', id.toString()),
        })

        if (exists) {
            console.log(`⚠️ Permission ID '${permissionId}' is already assigned to ${type} ID '${id}'. Skipping assignment.`)
            cli.ui.object(exists)
            return
        }

        const created = await create('permissions_assignments', {
            values: {
                permission_id: parseInt(permissionId, 10),
                assignable_type: type,
                assignable_id: id.toString(),
            }
        })

        cli.ui.object(created)
    })
