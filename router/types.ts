
export interface HttpContext {
    params: Record<string, string>
    query: Record<string, string | string[]>
    body: any
}

export interface Handler {
    (ctx: HttpContext): Promise<any> | any;
}
