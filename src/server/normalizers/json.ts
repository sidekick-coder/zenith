export function toDb(value: object | array): string | null {
    if (value === null) {
        return null
    }

    return JSON.stringify(value)
}

export function fromDb(value: any): object | array | null {
    if (value === null) {
        return null
    }

    return JSON.parse(value)
}