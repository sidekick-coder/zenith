import BelongsTo from './belongsTo.relation.ts'
import BaseRelation from './base.relation.ts'
import File from '#server/entities/file.entity.ts'

export class LoadFileUrl extends BaseRelation {
    public fileKey: string
    public property: string

    constructor(fileKey: string = 'file', property: string = 'url') {
        super()
        this.fileKey = fileKey
        this.property = property
    }

    public async load(entities: any[]) {
        for (const entity of entities) {
            const file: File | null = entity[this.fileKey]

            if (file) {
                await file.loadUrl()
            } 

            entity[this.property] = file ? file.url : null
        }
    }

}

export default class BelongsToFile extends BelongsTo {
    constructor(property: string = 'file', targetKey: string = 'file_id') {
        super({
            table: 'files',
            tableKey: 'id',
            
            targetTable: 'files',
            targetKey: targetKey,

            property: property,
            serialize: row => File.from(row)
        })
    }

    public static url(fileProperty: string = 'file', property: string = 'url') {
        return new LoadFileUrl(fileProperty, property)
    }
}