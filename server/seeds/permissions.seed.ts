import Permission from '#shared/entities/permission.entity.ts'
import { firstOrCreate } from '#server/queries/firstOrCreate.ts'

export async function run(): Promise<void> {
    const permissions: Permission[] = [
        new Permission({
            name: 'Administrator',
            description: 'Full access to all resources',
            action: 'manage',
            subject: 'all',
            origin: 'system',
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
                description: permission.description,
                origin: permission.origin,
                conditions: permission.conditions ? JSON.stringify(permission.conditions) : null,
            }
        })
        
    }
    
}
