import { set } from 'lodash-es'
import type { Database } from '#server/contracts/database.contract'
import db from '#server/facades/db.facade.ts'
import MetadataService from '#server/services/metadata.service.ts'

interface HasMetasOptions {
    table: keyof Database
    tableKey: string
    
    targetTable: keyof Database
    targetKey: string

    property: string
}

export default class HasMetas {
    public table: string
    public tableKey: string
    
    public targetTable: string
    public targetKey: string

    public property: string

    constructor(options: HasMetasOptions) {
        this.table = options.table
        this.tableKey = options.tableKey
        
        this.targetTable = options.targetTable
        this.targetKey = options.targetKey
        
        this.property = options.property
    }

    async load(entities: any[]) {
        const ids = new Set()

        entities.forEach(e => ids.add(e[this.tableKey]))
        
        if (!ids.size) return

        const query = db.selectFrom(this.targetTable as any) as any

        // Assumes your models have a standard .list() or .where()
        const results = await query.selectAll()
            .where(this.targetKey, 'in', Array.from(ids))
            .execute()

            
        entities.forEach(e => {
            const rows = results.filter((r: any) => r[this.targetKey] === e[this.tableKey])
            
            set(e, this.property, MetadataService.flatten(rows))
        })

    }
}