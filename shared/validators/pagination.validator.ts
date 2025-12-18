import { number, array } from './url.validator.ts'
import validator from '#shared/services/validator.service.ts'

export const base = validator.create(v => v.object({ 
    page: v.optional(number(), 1),
    limit: v.optional(number(), 10),
}))

/** @deprecated use base instead */
export const schema = base

interface OrderParams {
    allowed: string[]
    defaultOrder?: string | string[]
    defaultDirection?: ('asc' | 'desc') | ('asc' | 'desc')[]
}

export function order<T extends OrderParams>({ allowed, defaultOrder, defaultDirection }: T) {
    return validator.create(v => v.object({
        orderBy: v.optional(v.pipe(array(), v.array(v.picklist<T['allowed']>(allowed))), defaultOrder),
        orderDesc: v.optional(v.pipe(array(), v.array(v.picklist(['asc', 'desc'] as const))), defaultDirection),
    }))
}

export function orderDesc<T extends 'asc' | 'desc'>(defaultValue?: T[]) {
    return validator.create(v => v.optional(v.pipe(array(), v.array(v.picklist(['asc', 'desc'] as const))), defaultValue))
}


