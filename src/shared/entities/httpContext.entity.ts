import type CookieService from '#shared/services/cookie.service.ts'
import type UploadService from '#shared/services/upload.service.ts'

export default class HttpContext {
    public url: string
    public method: string
    public params: Record<string, string>
    public query: Record<string, string | string[]>
    public body: any
    public cookie: CookieService
    public upload: UploadService
    [key: string]: any;

    constructor(data: HttpContext) {
        Object.assign(this, data)
    }
}