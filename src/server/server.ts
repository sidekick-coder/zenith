import { register } from 'module'
import { basePath } from '@sidekick-coder/zenith-kit/server'
import { createApp } from './app.ts'
import LoggerWinsonService from '#server/services/loggerWinson.service.ts'

register('../../loader.js', import.meta.url)

const isDev = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test'
const isProd = process.env.NODE_ENV === 'production'

const prettyLogger = isDev || process.env.ZENITH_LOG_PRETTY === 'true' 

const logger = LoggerWinsonService.create({
    level: process.env.ZENITH_LOG_LEVEL || 'info',
    transports: [
        LoggerWinsonService.file(basePath('logs/error.log'), 'error'),
        LoggerWinsonService.file(basePath('logs/app.log')),
        prettyLogger ? LoggerWinsonService.console() : LoggerWinsonService.consoleJson(),
    ]
})

if (isProd && prettyLogger) {
    logger.warn('Pretty logging is enabled in production.')
}

const { lifecycle } = await createApp({ logger })

async function exit(code = 0) {
    process.exit(code)
}

process.on('SIGINT', () => exit(0))

process.on('message', (data: any) => {
    if (data?.type === 'shutdown') exit(0)
})

await lifecycle.emit(['register', 'load', 'boot'])

// await lifecycle.emit('shutdown')
