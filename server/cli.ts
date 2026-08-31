import {  basePath } from '@sidekick-coder/zenith-kit/server'
import { container, CliService } from '@sidekick-coder/zenith-kit/server'
import type { CliCommand } from '@sidekick-coder/zenith-kit/server'
import emmitter from './facades/emmitter.facade.ts'
import { createApp } from './app.ts'

const { logger, config, emmiter, lifecycle, env } = await createApp()

const cli = CliService
    .create()
    .setLogger(logger.child({ label: 'cli' }))
    .setDebug(config.getOne(['cli.debug', 'app.debug', 'debug'], false))
    .setEmmitter(emmitter)

cli.addDir(basePath('server/commands'))

const dirs = []

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
