import type { Response } from 'express'
import BaseException from '#server/exceptions/base.ts'
import logger from '#server/facades/logger.facade.ts'
import env from '#server/facades/env.facade.ts'

export default class ExceptionService {
    public ignoreCodeErrors: number[] = [404]
    public handle(error: Error, response: Response) {

        if (error instanceof BaseException && !this.ignoreCodeErrors.includes(error.statusCode)) {
            logger.error('Error occurred while processing request', {
                error: error.message,
                stack: error.stack,
            })
        }

        if (error instanceof BaseException) {
            return response.status(error.statusCode).json({
                error: error.name,
                message: error.message,
                stack: env.development ? error.stack : undefined,
            })
        }

        logger.error('Error occurred while processing request', {
            error: error.message,
            stack: error.stack,
        })

        const data = BaseException.fromError(error)

        return response.status(500).json({
            error: error.name || 'Internal Server Error',
            message: data.message || 'An unexpected error occurred',
        })
    }
}