import di from './di'

export interface Logger {
    info: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    log: (message: string, ...args: any[]) => void;
}

export const logger: Logger = di.proxy<Logger>('logger')
