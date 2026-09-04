export default class Pagination<T = Record<string, any>> {
    public items: T[]
    public total: number
    public page: number
    public per_page: number
    public total_pages: number

    constructor(data: Partial<Pagination>) {
        Object.assign(this, data)
    }

    public static from<T = Record<string, string> >(payload: Partial<Pagination<T>>): Pagination<T> {
        return new Pagination(payload as any)
    }
}