import { set, get } from 'lodash-es'
import { defineLoader } from './defineLoader.ts'
import User from '#server/entities/user.entity.ts'

interface UserLoaderOptions { 
    idKey?: string
    targetKey?: string
}

export async function loadUser<T extends Record<string, any>>(entities: T[], options?: UserLoaderOptions) {
    const idKey = options?.idKey || 'user_id'
    const targetKey = options?.targetKey || 'user'

    const ids = entities.map(e => get(e, idKey) as number).filter(Boolean)

    if (!ids.length) {
        return
    }

    const users = await User.list({ where: (eb) => eb('id', 'in', ids) })

    const map = new Map(users.map(u => [u.id, u]))

    for (const entity of entities) {
        const user = map.get(get(entity, idKey) as number)

        if (user) {
            set(entity, targetKey, user)
        }
    }
}

export function createUserLoader<T extends Record<string, any>>(options?: UserLoaderOptions) {
    return defineLoader<T>({ load: (entities) => loadUser(entities, options), })
}
