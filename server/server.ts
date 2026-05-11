import { basePath } from '@sidekick-coder/zenith-kit/server'
import { createApp } from './app.ts'
import env from '#server/facades/env.facade.ts'
import LoggerWinsonService from '#server/services/loggerWinson.service.ts'

const prettyLogger = env.development || env.get('ZENITH_LOG_PRETTY', false)

const logger = LoggerWinsonService.create({
    level: env.get('ZENITH_LOG_LEVEL', 'info'),
    transports: [
        LoggerWinsonService.file(basePath('logs/error.log'), 'error'),
        LoggerWinsonService.file(basePath('logs/app.log')),
        prettyLogger ? LoggerWinsonService.console() : LoggerWinsonService.consoleJson(),
    ]
})

if (env.production && prettyLogger) {
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
