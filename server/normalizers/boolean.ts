import db from '#server/facades/db.facade.ts'

export function toDb(value: boolean | number | null) {
    if (value === null) {
        return null
    }

    if (db.driver === 'sqlite') {
        return value ? 1 : 0
    }

    return value ? true : false
}

export function fromDb(value: string | null): Date | null {    
    if (value === null) {
        return null
    }

    if (db.driver === 'sqlite') {
        return value === 1 ? true : false
    }

    return value === 'true' ? true : false
}