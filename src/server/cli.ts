import  CliService, { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import { basePath, serverPath } from '@sidekick-coder/zenith-kit/server/utils/basePath'
import container from '@sidekick-coder/zenith-kit/server/facades/container'
import emmitter from '@sidekick-coder/zenith-kit/server/facades/emmitter'
import { createApp } from './app.ts'
import LoggerWinsonService from './services/loggerWinson.service.ts'

const logger = LoggerWinsonService.create({
    level: process.env.ZENITH_LOG_LEVEL || 'info',
    transports: [
        LoggerWinsonService.file(basePath('logs/error.log'), 'error'),
        LoggerWinsonService.file(basePath('logs/app.log')),
    ]
})

const { config, emmiter, lifecycle, env } = await createApp({ logger })

const cli = CliService
    .create()
    .setLogger(logger.child({ label: 'cli' }))
    .setDebug(config.getOne(['cli.debug', 'app.debug', 'debug'], false))
    .setEmmitter(emmitter)

const dirs = [serverPath('commands')]

dirs.push(...env.get('ZENITH_COMMAND_DIR'))

for (const dir of dirs) {
    cli.addDir(dir)
}

container.set(CliService, cli)

await emmiter.emitAndWait('cli:registered', { cli })

async function onPreAction(command: CliCommand) {
    const include = Array.from(command.needs)
    const defaults = ['TrasnlatorLifecycleHook']

    include.unshift(...defaults)

    await lifecycle.emit(['register', 'load', 'boot'], { include })
}

async function onPostAction(command: CliService) {
    const include = Array.from(command.needs)
    const defaults = ['TrasnlatorLifecycleHook']

    include.unshift(...defaults)

    await lifecycle.emit('shutdown', { include })
}

await cli.load()

cli
    .name('zenith')
    .hook('preAction', (_thisCommand, actionCommand) => onPreAction(actionCommand as any))
    .hook('postAction', (_thisCommand, actionCommand) => onPostAction(actionCommand as any))
    .parse()
