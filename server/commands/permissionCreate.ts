import { program } from 'commander'
import { create } from '#server/queries/create.ts'
import Permission from '#shared/entities/permission.entity.ts'
import cli from '#server/services/cli.service.ts'

program.command('permission:create')
    .helpGroup('permission')
    .description('Create a new permission')
    .requiredOption('-a, --action <action>', 'Permission action')
    .requiredOption('-s, --subject <subject>', 'Permission subject')
    .option('-c, --conditions <conditions>', 'Permission conditions, as JSON string', '{}')
    .action(async (options) => {
        const { subject, action, conditions } = options

        const permission = await create('permissions', {
            serialize: Permission.from,
            values: {
                subject,
                action,
                conditions: conditions ? JSON.stringify(JSON.parse(conditions)) : JSON.stringify({}),
            }
        })
    
        console.log('✓ Permission created and assigned successfully')

        cli.ui.object(permission)
    })
