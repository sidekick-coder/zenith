export function compose<T extends object[]>(...objects: T): T[number] {
    return Object.assign({}, ...objects)
}
