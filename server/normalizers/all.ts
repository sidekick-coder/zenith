import * as  datetime from './datetime.ts'

export function toDb(payload: Record<string, any>) {

    const result = { ...payload }

    for (const key in result) {
        if (result[key] instanceof Date) {
            result[key] = datetime.toDb(result[key])
        }
    }

    return result
}

export function fromDb(value: Record<string, any>) {
    const result = { ...value }

    for (const key in result) {
        // result[key] = parseValue(result[key])
    }

    return result
}