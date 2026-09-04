import LoggerService from '#shared/services/logger.service.ts'

const colors: any = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',

    fgBlack: '\x1b[30m',
    fgRed: '\x1b[31m',
    fgGreen: '\x1b[32m',
    fgYellow: '\x1b[33m',
    fgBlue: '\x1b[34m',
    fgMagenta: '\x1b[35m',
    fgCyan: '\x1b[36m',
    fgWhite: '\x1b[37m',

    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
}
export default class ClientLoggerService extends LoggerService {
    private commonMeta: any = {}

    constructor(commonMeta: any = {}) {
        super()
        this.commonMeta = commonMeta
    }

    public color(text: string, color: keyof typeof colors): string {
        return (colors as any)[color] + text + colors.reset
    }

    public log(level: 'log' | 'info' | 'debug' | 'warn' | 'error', message: string, meta?: any): void {    
        const { label } = this.commonMeta

        const colorLevels: any = {
            log: 'fgWhite',
            info: 'fgCyan',
            debug: 'fgBlue',
            warn: 'fgYellow',
            error: 'fgRed',
        }
    
        let result = this.color(`[${level}]`, colorLevels[level]) + ' '
        
        if (label) {
            result += `[${label}] `
        }

        result += message

        if (meta) {
            console[level](result, meta)
            return
        }

        console[level](result)
    }

    public info(message: string, meta?: any): void {
        return this.log('info', message, meta)
    }

    public debug(message: string, meta?: any): void {
        return this.log('debug', message, meta)
    }

    public warn(message: string, meta?: any): void {
        return this.log('warn', message, meta)
    }

    public error(message: string, meta?: any): void {
        return this.log('error', message, meta)
    }

    public child(options: any): ClientLoggerService {
        return new ClientLoggerService({
            ...this.commonMeta,
            ...options,
        })
    }
}
