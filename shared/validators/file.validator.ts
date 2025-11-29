import * as url from './url.validator.ts'
import * as metadata from './metadata.validator.ts'
import validator from '#shared/services/validator.service.ts'


export const filters = validator.create(v => v.pipe(
    url.object(),
    v.object({
        search: v.optional(v.string()),
        purpose: v.optional(
            v.pipe(
                v.union([v.string(), v.array(v.string())]),
                v.transform(v => typeof v === 'string' ? [v] : v)
            )
        ),
        metas: v.optional(metadata.query('file_metas', 'file_id'))
    })
))

export const schema = validator.create(v => v.object({ 
    client_name: v.string(),
    drive: v.string(),
    filename: v.string(),
    mimetype: v.string(),
    metadata: v.optional(v.record(v.string(), v.any()))
}))

export const upload = validator.create(v => v.object({ 
    client_name: v.string(),
    drive: v.string(),
    metadata: v.optional(v.record(v.string(), v.any()))
}))