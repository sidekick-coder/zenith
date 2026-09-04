import type { Application } from 'express'
import type { Request, Response } from 'express'
import { LoggerService } from '@sidekick-coder/zenith-kit/shared'
import BaseException from '#server/exceptions/base.ts'

export interface ViteServiceOptions {
    debug?: boolean
    logger?: LoggerService
}

export default class ViteService {
    public static __container_entry_key = 'ViteService'
    public logger: LoggerService
    public debug: boolean

    constructor(options?: ViteServiceOptions) {
        this.debug = !!options?.debug
        this.logger = options?.logger || new LoggerService()

        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }
    }

    public async load(_app: Application) {
        throw new BaseException('Not implemented yet')
    }

    public async handle(_request: Request, _response: Response): Promise<any> {
        throw new BaseException('Not implemented yet')
    }

    public async close() {
        throw new BaseException('Not implemented yet')
    }
}

