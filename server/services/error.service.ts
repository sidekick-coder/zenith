import type { Response } from 'express'
import BaseException from '#server/exceptions/base.ts'
import logger from '#server/facades/logger.facade.ts'

export class ErrorService {
    public handle(error: Error, response: Response) {
        Object.assign(error, { 
            timestamp: new Date().toISOString(),
            response
        })

        logger.error('Error occurred while processing request', error)

        if (error instanceof BaseException) {
            return response.status(error.statusCode).json({
                error: error.name,
                message: error.message,
            })
        }

        const data = BaseException.fromError(error)

        return response.status(500).json({
            error: error.name || 'Internal Server Error',
            message: data.message || 'An unexpected error occurred',
        })
    }
}

const errorService = new ErrorService()

export default errorService