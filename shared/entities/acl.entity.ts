import { defineAbility, subject as createSubject } from '@casl/ability'
import Permission from './permission.entity.ts'

export default class Acl {
    public ability: ReturnType<typeof defineAbility>
    public permissions: Permission[]

    constructor(permissions: Permission[]) {
        const perms = permissions.map((permission) => Permission.from(permission))

        this.permissions = perms
        
        this.ability = defineAbility((can) => {
            perms.forEach((permission) => {
                can(permission.action, permission.subject, permission.parsedConditions)
            })
        })
    }

    public can(action: string, subject: any, object?: Record<string, any>) {

        if (!object) {
            return this.ability.can(action, subject)
        }

        const subjectWithObject = createSubject(subject, object)

        return this.ability.can(action, subjectWithObject)
    }

    public cannot(action: string, subject: any, object?: Record<string, any>) {
        if (!object) {
            return this.ability.cannot(action, subject)
        }

        const subjectWithObject = createSubject(subject, object)

        return this.ability.cannot(action, subjectWithObject)
    }

    public subject(subject: string, object: Record<string, any>) {
        return createSubject(subject, object)
    }
}