import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import { create } from '#server/queries/create.ts'
import Permission from '#shared/entities/permission.entity.ts'
import cli from '#server/services/cli.service.ts'

const command = new CliCommand('permission:create')
    .need('db')
    .helpGroup('permission')
    .description('Create a new permission')
    .requiredOption('-n, --name <name>', 'Permission name')
    .requiredOption('-a, --action <action>', 'Permission action')
    .requiredOption('-s, --subject <subject>', 'Permission subject')
    .option('-c, --conditions <conditions>', 'Permission conditions, as JSON string', '{}')
    .option('--json', 'Output result as JSON')
    .action(async (options) => {
        const { name, subject, action, conditions } = options

        const permission = await create('permissions', {
            serialize: Permission.from,
            values: {
                name,
                subject,
                action,
                origin: 'cli',
                conditions: conditions ? JSON.stringify(JSON.parse(conditions)) : JSON.stringify({}),
            }
        })

        if (!permission) {
            console.log('❌ Failed to create permission')
            return
        }

        if (options.json) {
            console.log(JSON.stringify(permission))
            return
        }
    
        console.log('✓ Permission created and assigned successfully')

        cli.ui.object(permission)
    })

export default command
