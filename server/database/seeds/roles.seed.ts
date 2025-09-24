import type { Kysely } from 'kysely'
import type { Database } from '#server/contracts/database.contract.ts'
import Role from '#shared/entities/role.entity.ts'

export async function run(db: Kysely<Database>): Promise<void> {
    const roles: Role[] = [
        new Role({
            name: 'admin',
            description: 'Administrator with full access',
            editable: false 
        }),
    ]

    for (const role of roles) {
        const existing = await db.selectFrom('roles')
            .selectAll()
            .where('name', '=', role.name)
            .executeTakeFirst()

        if (!existing) {
            await db.insertInto('roles')
                .values(role)
                .execute()
        }
    }
    
}
