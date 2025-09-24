import { program } from 'commander'
import { create } from '#server/queries/create.ts'
import Permission from '#shared/entities/permission.entity.ts'
import { find } from '#server/queries/find.ts'
import User from '#server/entities/user.entity.ts'
import cli from '#server/services/cli.service.ts'
import { findOrFail } from '#server/queries/findOrFail.ts'
import { destroy } from '#server/queries/destroy.ts'

program.command('permission:detach')
    .helpGroup('permission')
    .description('Remove a permission from a entity')
    .requiredOption('-p, --permission-id <permissionId>', 'Permission ID')
    .requiredOption('-t, --type <type>', 'Assignable type (user, role)')
    .requiredOption('-i, --id <id>', 'Assignable ID')
    .action(async (options) => {
        const { type, id, permissionId } = options

        const assignment = await findOrFail('permissions_assignments', {
            query: (qb) => qb
                .selectAll()
                .where('permission_id', '=', Number(permissionId))
                .where('assignable_type', '=', type)
                .where('assignable_id', '=', id.toString()),
        })

        await destroy('permissions_assignments', {
            query: (qb) => qb.where('id', '=', assignment.id)
        })

        console.log('✓ Permission detached successfully')
    })
