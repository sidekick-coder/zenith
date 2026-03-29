import arte from '#server/facades/arte.facade.ts'
import { createUserPermission } from '#server/queries/index.ts'
import cli from '#server/services/cli.service.ts'
import User from '#server/entities/user.entity.ts'

arte.command('user:create-permission')
    .need('db')
    .helpGroup('user')
    .description('Create a new user permission')
    .requiredOption('-u, --user <user>', 'User ID or email')
    .requiredOption('-n, --name <name>', 'Permission name')
    .requiredOption('-a, --action <action>', 'Permission action')
    .requiredOption('-s, --subject <subject>', 'Permission subject')
    .option('-c, --conditions <conditions>', 'Permission conditions, as JSON string', '{}')
    .action(async (options) => {
        const { name, subject, action, conditions } = options

        const user = await User.findOneOrFail({
            query: q => q
                .$if(isNaN(options.user as any), eb => eb.where(eb2 => eb2.or([
                    eb2('email', '=', options.user as string),
                    eb2('username', '=', options.user as string)
                ])))
                .$if(!isNaN(options.user as any), eb => eb.where('id', '=', Number(options.user)))
        })

        const { permission } = await createUserPermission(user.id, {
            name,
            action,
            subject,
            conditions: JSON.parse(conditions)
        })

        cli.ui.object(permission)
    })
