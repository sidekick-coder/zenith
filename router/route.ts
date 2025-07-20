import type {
    Handler, HttpContext, Middleware 
} from './types.ts'

export default class Route {

    private data = {
        path: '',
        method: '',
        handler: null as Handler<any> | null,
        filename: null as string | null,
        middlewares: [] as Middleware[],
    }

    private metas: Record<string, any> = {}

    public path(path: string) {
        this.data.path = path
        return this
    }

    public method(method: string) {
        this.data.method = method.toUpperCase()
        return this
    }

    public handler(handler: Handler<any>) {
        this.data.handler = handler
        return this
    }

    public meta(key: string, value: any) {
        this.metas[key] = value
        return this
    }

    public name(name: string) {
        return this.meta('name', name)
    }

    public middleware(middleware: Middleware) {
        this.data.middlewares.push(middleware)
        return this
    }

    public get filename() {
        return this.data.filename
    }

    public seralize() {
        return {
            ...this.data,
            metas: this.metas,
        }
    }

    public get<T extends Handler<any> = Handler<HttpContext>>(path: string, handler: T) {
        return this.method('GET').path(path).handler(handler)
    }

}
