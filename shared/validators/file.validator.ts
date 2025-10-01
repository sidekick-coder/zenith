import { number } from './query.validator.ts'
import validator from '#shared/services/validator.service.ts'

const schema = validator.create(v => v.object({ 
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