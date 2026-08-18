import { userRepository } from '@sidekick-coder/zenith-kit/server'
import arte from '#server/facades/arte.facade.ts'
import { create } from '#server/queries/create.ts'
import Permission from '#shared/entities/permission.entity.ts'
import { findOneOrFail, findOne } from '#server/queries/index.ts'
import cli from '#server/services/cli.service.ts'

arte.command('permission:attach')
    .need('db')
    .helpGroup('permission')
    .description('Add a permission to a entity')
    .requiredOption('-p, --permissionId <permissionId>', 'Permission ID or name')
    .requiredOption('-t, --type <type>', 'Assignable type (user, role)')
    .requiredOption('-i, --id <id>', 'Assignable ID')
    .option('--json', 'Output result as JSON')
    .action(async (options) => {
        const { type, id, permissionId } = options

        const permission = await findOne('permissions', {
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
            await userRepository.findByIdOrFail(Number(id))
        }

        // if role check if role exists
        if (type === 'role') {
            await findOneOrFail('roles', { where: (qb) => qb('id', '=', Number(id)) })
        }

        const exists = await findOne('permissions_assignments', {
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

        if (!created) {
            console.log('❌ Failed to assign permission')
            return
        }

        if (options.json) {
            console.log(JSON.stringify(created))
            return
        }

        cli.ui.object(created)
    })
