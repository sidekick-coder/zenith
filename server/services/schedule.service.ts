import fs from 'fs'
import path from 'path'
import nodeSchedule from 'node-schedule'
import rootLogger from '../facades/logger.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Routine from '#server/entities/routine.entity.ts'
import BaseException from '#server/exceptions/base.ts'

const logger = rootLogger.child({ label: 'scheduler' })

export default class ScheduleService {
    private routines: Routine[] = []
    private filename: string | null = null

    public add(id: string, cron: string, handler: Function) {
        const data = { filename: this.filename, }

        logger.debug('adding routine', {
            id,
            cron,
            data 
        })

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

    public has(id: Routine['id']): boolean {
        return this.routines.some(routine => routine.id === id)
    }

    public start(id: Routine['id']): void {
        const routine = this.routines.find(r => r.id === id)

        if (!routine) {
            throw new BaseException(`Routine not found: ${id}`)
        }

        if (routine.job) {
            routine.job.cancel()
        }

        const child = logger.child({ 
            routineId: routine.id,
            routineCron: routine.cron
        })

        routine.job = nodeSchedule.scheduleJob(routine.cron, async () => {
            const [error] = await tryCatch(() => routine.handler())

            if (error) {
                child.error(error)
                return
            }

            child.info('routine executed')
        })

        child.info(`routine ${routine.id} started`)
    }

    public startAll() {
        for (const routine of this.routines) {     
            this.start(routine.id)
        }
    }

    public async stop(id: Routine['id']) {
        const routine = this.routines.find(r => r.id === id)

        if (!routine) {
            throw new BaseException('Routine not found', 404)
        }

        if (!routine.job) {
            return
        }

        routine.job.cancel()

        logger.info(`routine ${routine.id} stopped`)
    }

    public async stopAll() {
        for (const routine of this.routines) {
            await this.stop(routine.id)
        }
    }

    public async clear() {
        await this.stopAll()

        logger.debug('clear', { count: this.routines.length })

        this.routines = []
    }

    public list() {
        return this.routines
    }
}
