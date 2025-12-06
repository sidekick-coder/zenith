import LoggerService from '#shared/services/logger.service.ts'

export default class ClientLoggerService extends LoggerService {
    private commonMeta: any = {}

    constructor(commonMeta: any = {}) {
        super()
        this.commonMeta = commonMeta
    }

    public info(message: string, meta?: any): void {
        const mergedMeta = {
            ...this.commonMeta,
            ...meta,
        }

        if (Object.keys(mergedMeta).length > 0) {
            console.info(message, mergedMeta)
            return
        }

        console.info(message)
    }

    public debug(message: string, meta?: any): void {
        const mergedMeta = {
            ...this.commonMeta,
            ...meta,
        }

        if (Object.keys(mergedMeta).length > 0) {
            console.debug(message, mergedMeta)
            return
        }

        console.debug(message)
    }

    public warn(message: string, meta?: any): void {
        const mergedMeta = {
            ...this.commonMeta,
            ...meta,
        }

        if (Object.keys(mergedMeta).length > 0) {
            console.warn(message, mergedMeta)
            return
        }

        console.warn(message)
    }

    public error(message: string, meta?: any): void {
        const mergedMeta = {
            ...this.commonMeta,
            ...meta,
        }

        if (Object.keys(mergedMeta).length > 0) {
            console.error(message, mergedMeta)
            return
        }

        console.error(message)
    }

    public child(options: any): ClientLoggerService {
        const mergedMeta = {
            ...this.commonMeta,
            ...options,
        }
        return new ClientLoggerService(mergedMeta)
    }
}
