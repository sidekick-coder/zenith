import type { Handler } from "./types.ts"

export default class Route {
    public method: string
    public path: string
    public handler: Handler
    public metas: Record<string, any> = {}
    public filename: string | null = null

    constructor(method: string, path: string, filename: string | null = null, handler: Handler) {
        this.method = method.toUpperCase()
        this.path = path
        this.handler = handler
        this.filename = filename
    }

    public meta(key: string, value: any) {
        this.metas[key] = value
        return this
    }

    public name(name: string) {
        return this.meta('name', name)
    }

}
