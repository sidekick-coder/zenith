import * as url from './url.validator.ts'
import * as metadata from './metadata.validator.ts'
import validator from '#shared/services/validator.service.ts'


export const filters = validator.create(v => v.pipe(
    url.object(),
    v.object({
        id: v.optional(url.array()),
        search: v.optional(v.string()),
        purpose: v.optional(url.array()),
        client_name: v.optional(url.array()),
        metas: v.optional(metadata.query('file_metas', 'file_id')),
        include: v.optional(v.pipe(
            url.array(),
            v.array(v.picklist(['metas', 'url']))
        ))
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
