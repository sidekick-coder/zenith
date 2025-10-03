export default class CookieService {
    private cookies: Record<string, string> = {}

    constructor(cookies: Record<string, string> = {}) {
        this.cookies = cookies
    }

    public get(name: string, defaultValue: string | null = null): string | null {
        return this.cookies[name] || defaultValue
    }

    public set(_name: string, _value: string, options?: any) {
        throw new Error('Not implemented: CookieService.set()')
    }
}