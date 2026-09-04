import type { Request, Response } from 'express'
import type UploadService from '#server/services/upload.service.ts'
import type CookieService from '#shared/services/cookie.service.ts'

export interface HttpContextBase {
    url: string;
    method: string;
    params: Record<string, string>
    query: Record<string, string | string[]>
    body: any
    cookie: CookieService
    upload: UploadService
    request: Request;
    response: Response;
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
    (ctx: HttpContextBase & T): Promise<any> | any;
}
