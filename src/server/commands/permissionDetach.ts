import arte from '#server/facades/arte.facade.ts'
import { findOneOrFail } from '#server/queries/index.ts'
import { destroy } from '#server/queries/destroy.ts'

arte.command('permission:detach')
    .need('db')
    .helpGroup('permission')
    .description('Remove a permission from a entity')
    .requiredOption('-p, --permission-id <permissionId>', 'Permission ID')
    .requiredOption('-t, --type <type>', 'Assignable type (user, role)')
    .requiredOption('-i, --id <id>', 'Assignable ID')
    .action(async (options) => {
        const { type, id, permissionId } = options

        const assignment = await findOneOrFail('permissions_assignments', {
            where: (qb) => qb.and([
                qb('permission_id', '=', Number(permissionId)),
                qb('assignable_type', '=', type),
                qb('assignable_id', '=', id.toString())
            ]),
        })

        await destroy('permissions_assignments', { query: (qb) => qb.where('id', '=', assignment.id) })

        console.log('✓ Permission detached successfully')
    })
