export default class BaseException extends Error {
    public statusCode: number = 500
    constructor(message: string, statusCode: number = 500) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
    }
}