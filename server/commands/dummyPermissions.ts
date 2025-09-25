import { program } from 'commander'
import { faker } from '@faker-js/faker'
import Permission from '#shared/entities/permission.entity.ts'
import cli from '#server/services/cli.service.ts'
import { create } from '#server/queries/index.ts'


program.command('dummy:permissions')
    .helpGroup('dummy')
    .description('Create dummy permissions')
    .option('-l, --length <length>', 'Number of permissions to create', '10')
    .action(async (options) => {
        const length = Number(options.length)
        const array = Array.from({ length }, (_, i) => i + 1)

        const permissions = [] as Permission[]

        for await (const i of array) {
            const permission = await create('permissions', {
                serialize: Permission.from,
                values: {
                    name: `dummy:${i}`,
                    description: faker.lorem.sentence(),
                    action: faker.helpers.arrayElement(['create', 'read', 'update', 'delete']), 
                    subject: `Dummy:${faker.helpers.arrayElement(['Post', 'Comment', 'User'])}`
                }
            })

            permissions.push(permission)
        }
        

        cli.ui.table(permissions)
    })
