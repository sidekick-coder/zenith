import cp from 'child_process'
import chokidar from 'chokidar'
import { debounce } from 'lodash-es'
import { basePath } from '#server/utils/paths.ts'
import logger from '#server/facades/logger.facade.ts'
import arte from '#server/facades/arte.facade.ts'

let child: cp.ChildProcess | null = null

async function start() {
    const modulePath = basePath('index.ts')
    const execArgv = [
        '--no-warnings',
        '--experimental-strip-types'
    ]

    child = cp.fork(modulePath, [], {
        execArgv,
        silent: false,
        env: {
            ...process.env,
            ZARTE: 'false',
        }
    })

    child.on('error', (error) => {
        logger.error('Server process error:', error)
    })

    child.on('exit', (code, signal) => {
        if (code !== null && code !== 0) {
            logger.error(`Server process exited with code ${code}`)
        }

        if (signal) {
            logger.debug(`Server process killed with signal ${signal}`)
        }
    })

    // Listen for server-restart events from the child process
    child.on('message', (message) => {
        if (message === 'server-restart') {
            logger.debug('Received server-restart event from child process')

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
        }, 3000)

        current.once('exit', () => {
            clearTimeout(timeout)
            resolve()
        })
    })

    if (child === current) {
        child = null
    }
}

async function reload(info: any) {
    logger.debug('Reloading server...', info)

    await stop()

    await start()
}

function kill() {
    if (child) {
        child.kill('SIGTERM')
    }

    logger.info('Shutting down...')

    process.exit(0)
}

const reloadDebounced = debounce(reload, 500)

arte
    .command('serve')
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

        const entries = [
            'shared',
            'server',
            'modules',
            'langs',
            'index.ts',
            '.env'
        ]

        const ignore = [
            '.git',
            'arte',
            'node_modules',
            'commands',
            'seeds',
            'migrations',
            'templates',
            'tmp',
            'root',
            'client',
            'storage',
            '.volumes',
            'dist',
            'package-lock.json',
            'yarn.lock'
        ]

        logger.debug('Watching directories', entries)

        const watcher = chokidar.watch(entries.map(entry => basePath(entry)), {
            persistent: true,
            ignoreInitial: true,
            ignored: (path) => {
                if (ignore.some(i => path.includes(i))) {
                    return true
                }

                return false
            }
        })

        watcher.on('change', reloadDebounced)
        watcher.on('add', reloadDebounced)
        watcher.on('unlink', reloadDebounced)

        watcher.on('error', (error) => {
            logger.error('Watcher error:', error)
        })

        watcher.on('ready', () => {
            logger.debug('Watcher is ready')
        })

    })
