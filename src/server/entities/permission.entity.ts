import { flatten } from '@sidekick-coder/zenith-kit/shared/utils/flatten'
import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/permission.entity.ts'

export default class Permission extends composeWith(Base, Model('permissions')) {
    public static async listByAssignable(assignable_type: string, assignable_id: string) {
        return this.list({
            query: (qb) => qb
                .selectAll()
                .where('id', 'in', (eb) =>
                    eb.selectFrom('permissions_assignments')
                        .select('permission_id')
                        .where('assignable_type', '=', assignable_type)
                        .where('assignable_id', '=', assignable_id)
                )
        })
    }

    public static applyContext(permissions: Base[] = [], context: Record<string, any>) {
        const result: Base[] = []

        for (const permission of permissions) {       
            if (!permission.conditions) {
                result.push(permission as Base)
                continue
            }
            
            const values = flatten(context)

            for (const [key, value] of Object.entries(values)) {

                if (['string', 'number', 'boolean'].indexOf(typeof value) === -1) {
                    continue
                }

                // replace all occurrences of "{{ key }}" with quoted value
                const quotedPattern = new RegExp(`"{{\\s*${key}\\s*}}"`, 'g')
                const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g')

                if (typeof value === 'string') {
                    permission.conditions = permission.conditions.replace(quotedPattern, `"${value}"`)
                    permission.conditions = permission.conditions.replace(pattern, value)
                    continue
                }
                
                permission.conditions = permission.conditions.replace(quotedPattern, String(value))
                permission.conditions = permission.conditions.replace(pattern, String(value))
            }

            result.push(permission as Base)
        }

        return result.map((p) => this.from(p as any))
    }
}
