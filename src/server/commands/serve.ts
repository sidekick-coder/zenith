import cp from 'child_process'
import path from 'path'
import chokidar from 'chokidar'
import { debounce } from 'lodash-es'
import { serverPath, env } from '@sidekick-coder/zenith-kit/server'
import logger from '#server/facades/logger.facade.ts'
import arte from '#server/facades/arte.facade.ts'
import config from '#server/facades/config.facade.ts'

let child: cp.ChildProcess | null = null

async function start() {
    let filename = serverPath('server.mjs')

    const execArgv: string[] = []

    if (process.env.NODE_ENV !== 'production') {
        filename = serverPath('server.ts')
        execArgv.push('--no-warnings', '--experimental-strip-types')
    }

    child = cp.fork(filename, [], {
        execArgv,
        silent: false,
        env: {
            ...process.env,
            ZARTE: 'false',
        }
    })

    child.on('error', (error) => {
        logger.error('server error:', error)
    })

    child.on('exit', (code, signal) => {
        if (code !== null && code !== 0) {
            logger.error(`server process exited with code ${code}`)
        }

        if (signal) {
            logger.debug(`server process killed with signal ${signal}`)
        }
    })

    // Listen for server-restart events from the child process
    child.on('message', (message) => {
        if (message === 'server-restart') {
            if (config.get('arte.debug', false)) logger.debug('received server-restart event from child process')

            reload()
        }
    })
}

async function stop() {
    if (!child) return

    const current = child

    await new Promise<void>((resolve) => {
        current.send({ type: 'shutdown' })

        const timeout = setTimeout(() => {
            logger.warn('Server process did not exit in time, ending watching...')

            process.exit(1)
        }, 15000)

        current.once('exit', () => {
            clearTimeout(timeout)
            resolve()
        })
    })

    if (child === current) {
        child = null
    }
}

async function reload() {
    await stop()

    await start()
}

function kill() {
    if (child) {
        child.kill('SIGTERM')
    }

    if (config.get('arte.debug', false)) {
        logger.debug('shutting down...')
    }


    process.exit(0)
}

const reloadDebounced = debounce(reload, 500)

arte
    .command('serve')
    .helpGroup('core')
    .option('-w, --watch', 'Watch for changes and restart server')
    .action(async (options) => {

        await start()

        if (!child) {
            logger.error('Failed to start server process')
            return
        }

        process.on('SIGINT', kill)
        process.on('SIGTERM', kill)

        if (!options.watch) {
            return
        }

        const watchEntries = (env.get('ZENITH_SERVER_WATCH_ENTRIES', '') as string)
            .split(',')
            .filter(Boolean)
            .map(e => path.resolve(process.cwd(), e))

        if (!watchEntries.length) {
            logger.warn('No watch entries specified. Watching default entries.')
            return
        }

        const ignore = [
            '.git',
            'node_modules',
            'package-lock.json',
            'yarn.lock'
        ]

        if (config.get('arte.debug', false)) {
            logger.debug('watching changes')
        }

        logger.info('watching for changes', { entries: watchEntries, })

        const watcher = chokidar.watch(watchEntries, {
            persistent: true,
            ignoreInitial: true,
            ignored: (path) => {
                if (ignore.some(i => path.includes(i))) {
                    return true
                }

                return false
            }
        })

        watcher.on('all', (_event, path) => {
            logger.info(`file change: ${path}`)

            reloadDebounced()
        })

        watcher.on('error', (error) => {
            logger.error('watcher error:', error)
        })

        watcher.on('ready', () => {
            logger.debug('watcher ready, watching for changes...')
        })

    })
