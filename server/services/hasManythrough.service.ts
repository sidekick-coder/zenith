import type { Insertable, Selectable } from 'kysely'
import { updateOrCreate } from '../queries/index.ts'
import db from '#server/facades/db.facade.ts'
import type { Database } from '#server/contracts/database.contract.ts'

export interface HasManythroughServicePayload<T extends keyof Database, P extends keyof Database> {
    sourceId: number | string
    
    targetTable: T
    targetPrimaryKey: keyof Database[T]
    
    pivotTable: P
    pivotSourceKey: keyof Database[P]
    pivotTargetKey: keyof Database[P]

    debug?: boolean
}

export default class HasManythroughService<T extends keyof Database, P extends keyof Database> {
    public sourceId: number | string
    public targetTable: T
    public targetPrimaryKey: keyof Database[T]
    
    public pivotTable: P
    public pivotSourceKey: keyof Database[P]
    public pivotTargetKey: keyof Database[P]
   

    public debug = false
    
    constructor(payload: HasManythroughServicePayload<T, P>) {
        this.sourceId = payload.sourceId
        this.targetTable = payload.targetTable
        this.targetPrimaryKey = payload.targetPrimaryKey
        
        this.pivotTable = payload.pivotTable
        this.pivotSourceKey = payload.pivotSourceKey
        this.pivotTargetKey = payload.pivotTargetKey

        this.debug = payload.debug ?? false
    }

    public async list() {
        let query = db.selectFrom(this.targetTable).selectAll(this.targetTable) as any

        query = query
            .innerJoin(
                this.pivotTable as any,
                `${this.targetTable as string}.${String(this.targetPrimaryKey)}`,
                `${this.pivotTable as string}.${String(this.pivotTargetKey)}`
            )
            .where(`${this.pivotTable as string}.${String(this.pivotSourceKey)}`, '=', this.sourceId)

        if (this.debug) {
            console.log(query.compile())
        }

        const rows = await query.execute()

        return rows
    }

    public async attach(targetId: number | string, payload?: Partial<Insertable<Database[P]>>) {
        const values: any = {
            [this.pivotSourceKey]: this.sourceId,
            [this.pivotTargetKey]: targetId,
            ...payload,
        }

        await updateOrCreate(this.pivotTable as any, {
            where: (eb: any) => eb.and(values),
            values: values,
        })
    }

}