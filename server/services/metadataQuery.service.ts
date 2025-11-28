import type { ExpressionBuilder } from 'kysely'

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
}

export interface MetadataQueryPayload {
    [key: string]: string | Metadafilter
}

export default class MetadataQueryService {
    private payload: MetadataQueryPayload
    constructor(payload: MetadataQueryPayload) {
        this.payload = payload
    }

    public where = <DBQuery>(eb:  ExpressionBuilder<any, any>) => {
        let query = eb as any

        for (const [name, condition] of Object.entries(this.payload)) {
            if (typeof condition === 'string') {
                query = query.and([
                    eb.eb('name', '=', name),
                    eb.eb('value', '=', condition)
                ])
                continue
            }
        }

        return query as DBQuery
    }
}