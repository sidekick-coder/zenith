import fs from 'fs'
import path from 'path'
import nodeSchedule from 'node-schedule'
import rootLogger from '../facades/logger.facade.ts'
import { tryCatch } from '#shared/tryCatch.ts'
import Routine from '#server/entities/routine.entity.ts'

const logger = rootLogger.child({ label: 'scheduler.service' })

export default class ScheduleService {
    private routines: Routine[] = []
    private filename: string | null = null

    public add(id: string, cron: string, handler: Function) {
        const data = { filename: this.filename, }

        this.routines.push(new Routine({
            id,
            cron,
            handler,
            data
        }))
    }

    public async loadFile(filename: string) {
        if (!fs.existsSync(filename)) {
            logger.warn(`File not found: ${filename}`)
            return
        }

        const path = `${filename}?t=${Date.now()}` // Prevent caching issues

        this.filename = filename

        const [error] = await tryCatch(() => import(path))

        this.filename = null

        if (error) {
            logger.error(`failed to load routes from ${filename}`, error)
        }

        logger.debug('file loaded', { filename })
    }

    public async removeFile(filename: string) {
        const toRemove = this.routines.filter(routine => routine.data.filename === filename)

        for (const routine of toRemove) {
            this.routines = this.routines.filter(r => r !== routine)
        }

        logger.debug(`removed routes from ${filename}`)
    }

    public async loadDirectory(directory: string) {
        if (!fs.existsSync(directory)) {
            logger.warn('directory not found', { directory })
            return
        }

        const files = fs.readdirSync(directory).filter(file => file.endsWith('.ts'))

        for (const file of files) {
            await this.loadFile(path.join(directory, file))
        }
    }

    public start() {
        for (const routine of this.routines) {     
            nodeSchedule.scheduleJob(routine.cron, async () => {
                const [error] = await tryCatch(() => routine.handler())

                if (error) {
                    logger.error('error in routine', {
                        routine,
                        error
                    })
                    return
                }

                logger.info('routine executed', { routine })
            })

            logger.info('routine start', { routine })
        }
    }

    public async  stop() {
        await nodeSchedule.gracefulShutdown()
        logger.debug('Scheduler stopped')
    }

    public async clear() {
        await this.stop()

        logger.debug('clear', { count: this.routines.length })

        this.routines = []
    }

    public list() {
        return this.routines
    }
}
