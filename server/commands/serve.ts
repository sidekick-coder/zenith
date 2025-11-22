import cp from 'child_process'
import { program } from 'commander'
import chokidar from 'chokidar'
import { debounce } from 'lodash-es'
import { basePath } from '#server/utils/paths.ts'
import logger from '#server/facades/logger.facade.ts'

program.command('serve').option('-w, --watch', 'Watch for changes and restart server')
    .action((options) => {
        const modulePath = basePath('index.ts')
        const execArgv = [
            '--no-warnings',
            '--experimental-strip-types'
        ]

        let serverProcess: cp.ChildProcess | null = null

        const reload = debounce(() => {
            if (serverProcess) {
                serverProcess.kill()
                logger.debug('stopped server...')
                logger.debug('reload server...')
            }


            serverProcess = cp.fork(modulePath, [], { 
                execArgv,
                silent: false,
                env: {
                    ...process.env,
                    ZARTE: 'false',
                }
            })

            // Listen for server-restart events from the child process
            serverProcess.on('message', (message) => {
                if (message === 'server-restart') {
                    logger.debug('Received server-restart event from child process')
                    reload()
                }
            })

            serverProcess.on('error', (error) => {
                logger.error('Server process error:', error)
            })

            serverProcess.on('exit', (code, signal) => {
                if (code !== null && code !== 0) {
                    logger.error(`Server process exited with code ${code}`)
                }
                if (signal) {
                    logger.debug(`Server process killed with signal ${signal}`)
                }
            })
        }, 100)

        if (options.watch) {
            const entries = [
                'shared',
                'server',
                'modules',
            ]

            const ignore = [
                '.git', 
                'arte',
                'node_modules',
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

            watcher.on('change', (path) => {
                logger.debug(`File changed: ${path}`)
                reload()
            })

            watcher.on('add', (path) => {
                logger.debug(`File added: ${path}`)
                reload()
            })

            watcher.on('unlink', (path) => {
                logger.debug(`File removed: ${path}`)
                reload()
            })

            watcher.on('error', (error) => {
                logger.error('Watcher error:', error)
            })

            watcher.on('ready', () => {
                logger.debug('Watcher is ready')
                reload()
            })

            process.on('SIGINT', () => {
                logger.info('Shutting down...')

                watcher.close()
                
                if (serverProcess) {
                    serverProcess.kill('SIGTERM')
                }

                process.exit(0)
            })
        } else {
            reload()
        }
    })
