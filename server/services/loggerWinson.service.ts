import winston from 'winston'
import chalk from 'chalk'
import LoggerService from '#shared/services/logger.service.ts'

const { format } = winston

export default class LoggerWinsonService extends LoggerService {
    private logger: winston.Logger

    constructor(logger: winston.Logger) {
        super()

        this.logger = logger
    }

    public static print(object: any, indent: number = 0): string {
        let result = ''

        for (const key in object) {
            const value = object[key]

            if (indent > 0) {
                result += '|' + '-'.repeat(indent) + ' '
            }

            result += key + ': '

            if (typeof value === 'function') {
                result += '[Object Function]\n'
                continue
            }

            if (typeof value === 'object') {
                result += '\n' + LoggerWinsonService.print(value, indent + 2)
                continue
            }

            result += value + '\n'
        }

        return result
    }


    
    public static format(data: any) {
        const { raw, level, message, timestamp, label, stack, ...rest } = data

        if (raw) {
            return message
        }

        const colors: Record<string, string> = {
            error: 'red',
            warn: 'yellow',
            info: 'cyan',
            debug: 'blue',
        }

        const levelColor = (message: string) => {
            const color = colors[level]

            if (color) {
                return (chalk as any)[color](message)
            }

            return message
        }

        let result = ''

        result += `[${timestamp}] `

        result += levelColor(`[${level}]`) + ':'

        if (label) {
            result += ` ${chalk.gray(label)}`
        }

        result += ` ${message}`

        if (Object.keys(rest).length > 0) {
            result += '\n' + chalk.gray(LoggerWinsonService.print(rest).trim())
        }

        if (stack) {
            result += `\n${stack}`
        }

        return result.trim()
    }

    public static console(){
        return new winston.transports.Console({
            format: format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                format.printf(LoggerWinsonService.format)
            ),
        })
    }

    public static file(filename: string, level: string = 'info'){
        return new winston.transports.File({
            filename,
            level,
            format: winston.format.json(),
        })
    }

    public static create(options?: winston.LoggerOptions) {
        return new LoggerWinsonService(winston.createLogger(options))
    }

    public info(message: string, meta?: any): void {
        if (meta) {
            this.logger.info(message, meta)
            return
        }

        this.logger.info(message)
    }

    public debug(message: string, meta?: any): void {
        if (meta) {
            this.logger.debug(message, meta)
            return
        }

        this.logger.debug(message)
    }

    public warn(message: string, meta?: any): void {
        if (meta) {
            this.logger.warn(message, meta)
            return
        }

        this.logger.warn(message)
    }

    public error(message: string, meta?: any): void {
        if (meta) {
            this.logger.error(message, meta)
            return
        }

        this.logger.error(message)
    }

    public child(options: any): LoggerService {
        const childLogger = this.logger.child(options)
        
        return new LoggerWinsonService(childLogger)
    }
}
