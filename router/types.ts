import type { CookieOptions } from 'express'

export interface HttpContext {
    params: Record<string, string>
    query: Record<string, string | string[]>
    body: any
    cookie: {
        get(name: string): string | undefined
        set(name: string, value: string, options?: CookieOptions): void
    }
}

export interface Handler {
    (ctx: HttpContext): Promise<any> | any;
}
