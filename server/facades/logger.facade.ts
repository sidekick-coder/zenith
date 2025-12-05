import winston from 'winston'
import chalk from 'chalk'
import env from '#server/env.ts'

const { format } = winston

export function printObject(object: any, indent: number = 0): string {
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
            result += '\n' + printObject(value, indent + 2)
            continue
        }

        result += value + '\n'
    }

    return result
}

export function formatLog(data: any) {
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

    if (!env.ZARTE) {
        result += `[${timestamp}] `
    }

    result += levelColor(`[${level}]`) + ':'

    if (label) {
        result += ` ${chalk.gray(label)}`
    }

    result += ` ${message}`

    if (Object.keys(rest).length > 0) {
        result += '\n' + chalk.gray(printObject(rest).trim())
    }

    if (stack) {
        result += `\n${stack}`
    }

    return result.trim()
}

function filter() {
    return format((info: any) => {
        if (!info.label) {
            return info
        }

        if (info.level !== 'error' && env.LOG_LABEL_EXCLUDE?.includes(info.label)) {
            return false
        }

        return info
        
    })
}

const transports: winston.transport[] = [
    new winston.transports.Console({
        format: format.combine(
            filter()(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss', }),
            format.printf(formatLog)
        ),
    }),
]

if (!env.ZARTE) {
    transports.push(
        new winston.transports.File({
            filename: 'storage/logs/error.log', 
            level: 'error' 
        }),
        new winston.transports.File({ filename: 'storage/logs/app.log' }),
    )
}

export const logger = winston.createLogger({
    level: env.LOG_LEVEL,
    format: winston.format.json(),
    transports,
})

export default logger
