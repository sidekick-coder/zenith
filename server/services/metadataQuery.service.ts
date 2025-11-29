import type { ExpressionBuilder } from 'kysely'
import type { Database } from '#server/contracts/database.contract'

export interface Metadafilter {
    eq?: string,
    neq?: string,
    
    like?: string,
    nlike?: string,

    in?: string[],
    nin?: string[],

    gt?: string,
    gte?: string,
    lt?: string,
    lte?: string,

    is_null?: boolean
    exists?: boolean
}

export interface MetadataQueryPayload {
    [key: string]: string | Metadafilter
}

export default class MetadataQueryService<T extends keyof Database> {
    private payload: MetadataQueryPayload
    private table: T
    private foreignKey: keyof Database[T]
    private parentKey = 'id'

    constructor(payload: MetadataQueryPayload, table: T, foreignKey: keyof Database[T], parentKey?: string) {
        this.payload = payload
        this.table = table
        this.foreignKey = foreignKey

        if (parentKey) {
            this.parentKey = parentKey
        }
    }

    public get needWhereIn(){
        for (const condition of Object.values(this.payload)) {
            if (typeof condition === 'string') {
                return true
            }

            if (condition.exists === true) {
                return true
            }
        }

        return false
    }

    public get needWhereNotIn(){
        for (const condition of Object.values(this.payload)) {
            if (typeof condition === 'string') continue

            if (condition.exists === false) {
                return true
            }
        }

        return false
    }

    public apply(dbQuery: any) {
        let query = dbQuery

        if (this.needWhereIn) {
            query = query
                .where(this.parentKey, 'in', (eb: any) => 
                    eb.selectFrom(this.table)
                        .select(this.foreignKey)
                        .where(this.whereIn(eb))
                )
        }

        if (this.needWhereNotIn) {
            query = query
                .where(this.parentKey, 'not in', (eb: any) => 
                    eb.selectFrom(this.table)
                        .select(this.foreignKey)
                        .where(this.whereNotIn(eb))
                )
        }

        return query
    }

    public whereIn = <DBQuery>(eb:  ExpressionBuilder<any, any>) => {
        let query = eb as any

        for (const [name, condition] of Object.entries(this.payload)) {
            if (typeof condition === 'string') {
                query = query.and([
                    eb.eb('name', '=', name),
                    eb.eb('value', '=', condition)
                ])
                continue
            }

            if (condition.is_null !== undefined) {
                query = query.and([
                    eb.eb('name', '=', name),
                    eb.eb('value', condition.is_null ? 'is' : 'is not', null)
                ])
            }

            if (condition.exists) {
                query = query('name', '=', name)
            }

        }

        return query as DBQuery
    }

    public whereNotIn = <DBQuery>(eb:  ExpressionBuilder<any, any>) => {
        let query = eb as any

        for (const [name, condition] of Object.entries(this.payload)) {
            if (typeof condition === 'string') continue

            if (condition.exists === false) {
                query = query('name', '=', name)
            }
        }

        return query as DBQuery
    }
}