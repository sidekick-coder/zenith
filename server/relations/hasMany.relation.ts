import db from '#server/facades/db.facade.ts'

interface HasManyOptions {
    table: string
    tableKey: string
    
    targetTable: string
    targetKey: string

    property: string
    serialize?: (row: any) => any
}

export default class HasMany {
    public table: string
    public tableKey: string
    
    public targetTable: string
    public targetKey: string

    public property: string
    public serialize: (row: any) => any

    constructor(options: HasManyOptions) {
        this.table = options.table
        this.tableKey = options.tableKey
        
        this.targetTable = options.targetTable
        this.targetKey = options.targetKey
        
        this.property = options.property
        this.serialize = options.serialize || ((row: any) => row)
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

        const rows = results.map((r: any) => this.serialize(r))
        
        entities.forEach(e => {
            e[this.property] = rows.filter((r: any) => r[this.targetKey] === e[this.tableKey])
        })
    }
}