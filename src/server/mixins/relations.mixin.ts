import type { Constructor } from '@sidekick-coder/zenith-kit/shared/utils/compose'

interface Relation {
    load(entities: any[]): Promise<void>
}

export function Relation<R extends Record<string, Relation>>(relations: R) {
    return function RelationExtend<TBase extends Constructor>(Base: TBase) {
        return class extends Base {

            public static async load<T>(this: new () => T, entities: T | T[], names: keyof R | (keyof R)[]) {
                const items = Array.isArray(entities) ? entities : [entities]
                const relationNames = Array.isArray(names) ? names : [names]

                for (const name of relationNames) {
                    const relation = relations?.[name as string] as Relation

                    if (!relation) {
                        throw new Error(`Relation ${String(name)} declared`)
                    }

                    await relation.load(items)
                }

            }
            
        }
    }
}
