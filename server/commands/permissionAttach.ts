import { program } from 'commander'
import { create } from '#server/queries/create.ts'
import Permission from '#shared/entities/permission.entity.ts'
import { findOneOrFail } from '#server/queries/index.ts'
import cli from '#server/services/cli.service.ts'
import User from '#server/entities/user.entity.ts'

program.command('permission:attach')
    .helpGroup('permission')
    .description('Add a permission to a entity')
    .requiredOption('-p, --permissionId <permissionId>', 'Permission ID or name')
    .requiredOption('-t, --type <type>', 'Assignable type (user, role)')
    .requiredOption('-i, --id <id>', 'Assignable ID')
    .action(async (options) => {
        const { type, id, permissionId } = options

        const permission = await findOneOrFail('permissions', {
            serialize: Permission.from,
            where: (qb) => {
                if (!Number.isInteger(parseInt(permissionId, 10))) {
                    return qb('name', '=', permissionId)
                }

                return qb('id', '=', parseInt(permissionId, 10))
            }
        })

        if (!permission) {
            throw new Error(`Permission with ID '${permissionId}' does not exist.`)
        }

        // if user check if user exists
        if (type === 'user') {
            await User.findByIdOrFail(Number(id))
        }

        // if role check if role exists
        if (type === 'role') {
            await findOneOrFail('roles', {
                where: (qb) => qb('id', '=', Number(id))
            })
        }

        const exists = await findOneOrFail('permissions_assignments', {
            where: (qb) => qb.and([
                qb('permission_id', '=', permission.id),
                qb('assignable_type', '=', type),
                qb('assignable_id', '=', id.toString()),
            ])
        })

        if (exists) {
            console.log(`⚠️ Permission ID '${permissionId}' is already assigned to ${type} ID '${id}'. Skipping assignment.`)
            cli.ui.object(exists)
            return
        }

        const created = await create('permissions_assignments', {
            values: {
                permission_id: permission.id,
                assignable_type: type,
                assignable_id: id.toString(),
            }
        })

        cli.ui.object(created)
    })
