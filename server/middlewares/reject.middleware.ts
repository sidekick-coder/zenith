import BaseException from '#server/exceptions/base.ts'
import type { Middleware, } from '#server/contracts/router.contract.ts'

export default class RejectMiddleware implements Middleware {
    private message: string
    private statusCode: number

    constructor(message: string = 'Action is not allowed', statusCode: number = 403) {
        this.message = message
        this.statusCode = statusCode
    }

    public async handle(): Promise<void> {
        throw new BaseException(this.message, this.statusCode)
    }

    public static create(message?: string, statusCode?: number) {
        return new RejectMiddleware(message, statusCode)
    }
}