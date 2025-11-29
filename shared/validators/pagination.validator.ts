import { number } from './url.validator.ts'
import validator from '#shared/services/validator.service.ts'


export const schema = validator.create(v => v.object({ 
    page: v.optional(number(), 1),
    limit: v.optional(number(), 10),
}))

