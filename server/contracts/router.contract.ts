import type { CookieOptions } from 'express'

export interface HttpContextBase {
    url: string;
    method: string;
    params: Record<string, string>
    query: Record<string, string | string[]>
    body: any
    cookie: {
        get(name: string): string | undefined
        set(name: string, value: string, options?: CookieOptions): void
    }
    file(name: string): Promise<Express.Multer.File | undefined>
    files(name: string): Promise<Express.Multer.File[] | undefined>
    [key: string]: any; // Allow additional properties
}

export interface Redirect {
    redirect: string;
}

export type HttpContext<M extends Middleware[] = Middleware[]> = HttpContextBase & MiddlewareHandleResult<M>

export type HandleResult = Record<string, any> | Redirect | void;


export interface Middleware {
    handle(ctx: any): HandleResult | Promise<HandleResult>;
}
// export type MiddlewareHandleResult<T extends Middleware = Middleware> = T extends Middleware ? Awaited<ReturnType<T['handle']>> : never;
export type MiddlewareHandleResult<T extends Middleware[] = Middleware[]> = 
    T extends (infer M)[]
        ? M extends Middleware
            ? Awaited<ReturnType<M['handle']>> extends Record<string, any>
                ? Awaited<ReturnType<M['handle']>>
                : { [key: string]: any;}
            : { [key: string]: any;}
        : { [key: string]: any;};


export interface Handler<T = Record<string, any>> {
    (ctx: T & HttpContextBase): Promise<any> | any;
}
