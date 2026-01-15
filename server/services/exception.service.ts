import type { Response } from 'express'
import BaseException from '#server/exceptions/base.ts'
import logger from '#server/facades/logger.facade.ts'
import env from '#server/facades/env.facade.ts'

export default class ExceptionService {
    public ignoreCodeErrors: number[] = [
        400,
        401,
        403,
        404,
        422,
    ]
    public handle(error: Error, response: Response) {

        Object.assign(error, { 
            timestamp: new Date().toISOString(),
            status: response.statusCode,
        })
        
        
        
        if (error instanceof BaseException) {

            if (!this.ignoreCodeErrors.includes(error.statusCode)) {
                logger.error('Error occurred while processing request', error)
            }

            return response.status(error.statusCode).json({
                error: error.name,
                message: error.message,
                stack: env.development ? error.stack : undefined,
            })
        }

        logger.error('Error occurred while processing request', error)

        const data = BaseException.fromError(error)

        return response.status(500).json({
            error: error.name || 'Internal Server Error',
            message: data.message || 'An unexpected error occurred',
        })
    }
}