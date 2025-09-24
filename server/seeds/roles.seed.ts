import type { Kysely } from 'kysely'
import type { Database } from '#server/contracts/database.contract.ts'
import Role from '#shared/entities/role.entity.ts'
import { find } from '#server/queries/find.ts'
import { create } from '#server/queries/create.ts'

export async function run(db: Kysely<Database>): Promise<void> {
    const roles: Role[] = [
        new Role({
            name: 'admin',
            description: 'Administrator with full access',
            editable: false 
        }),
    ]

    for (const role of roles) {
        const existing = await find('roles', {
            serialize: Role.from,
            query: (qb) => qb.selectAll().where('name', '=', role.name)
        })

        if (!existing) {
            const created = await create('roles', {
                serialize: Role.from,
                values: role,
            })

            const permission = await create('permissions', {
                values: {
                    action: 'manage',
                    subject: 'all',
                    conditions: JSON.stringify({}),
                    editable: false,
                }
            })

            await create('role_permissions', {
                values: {
                    role_id: created.id,
                    permission_id: permission.id,
                }
            })
        }
    }
    
}
