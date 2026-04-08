import { set } from 'lodash-es'
import { defineLoader } from './defineLoader.ts'
import File from '#server/entities/file.entity.ts'

export function createFileUrlLoader<T extends Record<string, any>>(fileIdProperty: keyof T, urlProperty: string) {
    return defineLoader<T>({
        async load(entities: T[]) {
            const fileIds = entities.map(e => e[fileIdProperty] as number).filter(Boolean)

            if (!fileIds.length) {
                return
            }

            const files = await File.list({ where: (eb) => eb('id', 'in', fileIds) })

            await Promise.all(files.map(async (file) => file.loadUrl()))

            for (const entity of entities) {
                const file = files.find(f => f.id === entity[fileIdProperty])

                if (file) {
                    set(entity, urlProperty as string, file.url)
                }
            }

        }
    })
}
