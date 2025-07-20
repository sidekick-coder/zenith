import type { CookieOptions } from 'express'

export interface HttpContext {
    params: Record<string, string>
    query: Record<string, string | string[]>
    body: any
    cookie: {
        get(name: string): string | undefined
        set(name: string, value: string, options?: CookieOptions): void
    }
    [key: string]: any; // Allow additional properties
}

export type MiddlewareResult = Record<string, any> | Promise<Record<string, any>> | void

export interface Middleware {
    handle(ctx: HttpContext): Promise<MiddlewareResult> | MiddlewareResult;
}

export interface Handler {
    (ctx: HttpContext): Promise<any> | any;
}
