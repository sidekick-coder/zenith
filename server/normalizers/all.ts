import * as  datetime from './datetime.ts'

export function toDb(value: any) {
    if (value === null || value === undefined) {
        return value
    }

    if (value instanceof Date) {
        return datetime.toDb(value)
    }

    return value
}

export function fromDb(value: any) {
    if (value === null || value === undefined) {
        return value
    }

    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
        return datetime.fromDb(value)
    }

    return value
}