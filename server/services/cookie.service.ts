import type {
    Request, 
    Response,
    CookieOptions
} from 'express'
import Base from '#shared/services/cookie.service.ts'

export default class CookieService extends Base {
    private request: Request
    private response: Response

    constructor(request: Request, response: Response) {
        super(request.cookies)

        this.request = request
        this.response = response
    }

    public set(_name: string, _value: string) {
        const opts: CookieOptions = {
            httpOnly: true,
        }

        this.response.cookie(_name, _value, opts)
    }
}