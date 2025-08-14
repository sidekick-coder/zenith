import cp from 'child_process'
import { program } from 'commander'
import chokidar from 'chokidar'
import { basePath } from '#server/utils/paths.ts'
import logger from '#server/facades/logger.facade.ts'

program.command('serve').option('-w, --watch', 'Watch for changes and restart server')
    .action((options) => {
        const bin = 'node'

        const args = [
            '--no-warnings',
            '--experimental-strip-types',
            '--env-file',
            basePath('.env'),
            'index.ts'
        ]

        let serverProcess: cp.ChildProcess = cp.spawn(bin, args, { stdio: 'inherit', })

        const reload = () => {
            if (serverProcess) {
                serverProcess.kill()
                logger.debug('stopped server...')
            }

            logger.debug('reload server...')

            serverProcess = cp.spawn(bin, args, { stdio: 'inherit', })
        }

        if (options.watch) {
            const entries = [
                'shared',
                'server'
            ]

            const ignore = ['.git','node_modules', 'client', 'storage']

            logger.debug('Watching directories', entries)
            
            const watcher = chokidar.watch(entries.map(entry => basePath(entry)), {
                persistent: true,
                ignoreInitial: true,
                ignored: (path) => {
                    if (ignore.includes(path)) {
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
                    serverProcess.kill()
                }

                process.exit(0)
            })
        } else {
            reload()
        }
    })
