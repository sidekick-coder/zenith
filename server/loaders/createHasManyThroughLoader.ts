import { set } from 'lodash-es'
import { defineLoader } from './defineLoader.ts'

export interface HasManyThroughLoaderOptions<
    TEntity extends Record<string, any>,
    TPivot extends Record<string, any>,
    TRelated extends Record<string, any>,
> {
    entityKey?: keyof TEntity
    pivotRepository: { findMany(options?: any): Promise<TPivot[]> }
    foreignKey: keyof TPivot
    relatedKey: keyof TPivot
    relatedRepository: { findMany(options?: any): Promise<TRelated[]> }
    relatedEntityKey?: keyof TRelated
    property: string
}

export function createHasManyThroughLoader<
    TEntity extends Record<string, any>,
    TPivot extends Record<string, any>,
    TRelated extends Record<string, any>,
>(options: HasManyThroughLoaderOptions<TEntity, TPivot, TRelated>) {
    const {
        entityKey = 'id' as keyof TEntity,
        pivotRepository,
        foreignKey,
        relatedKey,
        relatedRepository,
        relatedEntityKey = 'id' as keyof TRelated,
        property,
    } = options

    return defineLoader<TEntity>({
        async load(entities: TEntity[]) {
            const entityIds = entities.map(e => e[entityKey]).filter(Boolean)

            if (!entityIds.length) return

            const pivotRows = await pivotRepository.findMany({ [foreignKey]: entityIds, })

            if (!pivotRows.length) {
                for (const entity of entities) {
                    set(entity, property, [])
                }
                return
            }

            const relatedIds = [...new Set(pivotRows.map(p => p[relatedKey]).filter(Boolean))]

            const relatedEntities = await relatedRepository.findMany({ [relatedEntityKey]: relatedIds, })

            for (const entity of entities) {
                const entityId = entity[entityKey]

                const pivotForEntity = pivotRows.filter((p: any) => p[foreignKey] === entityId)

                const related = pivotForEntity
                    .map(p => relatedEntities.find((r: any) => r[relatedEntityKey] === p[relatedKey]))
                    .filter(Boolean)

                set(entity, property, related)
            }
        }
    })
}

