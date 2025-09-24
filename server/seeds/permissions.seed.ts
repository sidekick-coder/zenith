import Permission from '#shared/entities/permission.entity.ts'
import { firstOrCreate } from '#server/queries/firstOrCreate.ts'

export async function run(): Promise<void> {
    const permissions: Permission[] = [
        new Permission({
            name: 'Administrator',
            action: 'manage',
            subject: 'all',
        }),
    ]

    for (const permission of permissions) { 
        await firstOrCreate('permissions', {
            serialize: Permission.from,
            select: (qb) => qb.selectAll().where('name', '=', permission.name),
            values: {
                name: permission.name,
                action: permission.action,
                subject: permission.subject,
            }
        })
        
    }
    
}
