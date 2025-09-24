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

export type HttpContext<M extends readonly Middleware[] = readonly Middleware[]> = HttpContextBase & MiddlewareHandleResult<M>

export type HandleResult = Record<string, any> | Redirect | void;


export interface Middleware {
    handle(ctx: any): HandleResult | Promise<HandleResult>;
}

export type UnionToIntersection<U> = 
  (U extends any ? (x: U) => void : never) extends ((x: infer I)=> void) ? I : never

// Extract the context properties that middleware can add
type ExtractMiddlewareContext<M extends Middleware> = 
    Awaited<ReturnType<M['handle']>> extends Record<string, any> 
        ? Awaited<ReturnType<M['handle']>>
        : {}

// Process array of middleware and extract all context properties
type ProcessMiddlewareArray<T extends readonly Middleware[]> = 
    T extends readonly [infer First extends Middleware, ...infer Rest extends readonly Middleware[]]
        ? ExtractMiddlewareContext<First> & ProcessMiddlewareArray<Rest>
        : {}

export type MiddlewareHandleResult<T extends readonly Middleware[] = readonly Middleware[]> = ProcessMiddlewareArray<T>


export interface Handler<T = Record<string, any>> {
    (ctx: T & HttpContextBase): Promise<any> | any;
}
