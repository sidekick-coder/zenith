import cp from 'child_process'
import fs from 'fs'
import { program } from 'commander'
import { basePath } from '#server/utils/paths.ts'
import logger from '#server/facades/logger.facade.ts'

program.command('serve').option('-w, --watch', 'Watch for changes and restart server').action((options) => {
    const bin = 'node'

    const args = [
        '--no-warnings',
        '--experimental-strip-types',
        '--env-file',
        basePath('.env'),
    ]

    const ignore = [
        '.git',
        'client',
        'server/.runtime',
        'config',
        'node_modules',
        'storage'
    ]

    const entries = [
        'shared',
    ]

    fs.readdirSync(basePath('server'))
        .map(e => `server/${e}`)
        .filter(e => !ignore.includes(e))
        .forEach(e => entries.push(e))

    const modules = fs.readdirSync(basePath('modules'), { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

    for (const module of modules) {
        const modulePaths = fs.readdirSync(basePath(`modules/${module}`)).filter(dir => !ignore.includes(dir))

        entries.push(...modulePaths.map(path => `modules/${module}/${path}`))
    }

    if (options.watch) {
        args.push('--watch', '--watch-preserve-output')

        entries.forEach(dir => {
            args.push(`--watch-path=./${dir}`)
        })

        logger.debug('Watching directories', entries)
    }

    args.push('index.ts')

    cp.spawn(bin, args, {
        stdio: 'inherit',
        shell: true,
    })
})
