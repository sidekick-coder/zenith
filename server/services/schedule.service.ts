import fs from 'fs'
import path from 'path'
import nodeSchedule from 'node-schedule'
import logger from '../facades/logger.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Routine from '#server/entities/routine.entity.ts'
import BaseException from '#server/exceptions/base.ts'

export default class ScheduleService {
    private routines: Routine[] = []
    private filename: string | null = null
    private logger = logger.child({ label: 'scheduler' })

    public add(id: string, cron: string, handler: Function) {
        const data = { filename: this.filename, }

        this.routines.push(new Routine({
            id,
            cron,
            handler,
            data
        }))

        this.logger.info(`${id} routine added`, {
            id,
            cron,
            filename: this.filename
        })
    }

    public async loadFile(filename: string) {
        if (!fs.existsSync(filename)) {
            this.logger.warn(`File not found: ${filename}`)
            return
        }

        const path = `${filename}?t=${Date.now()}` // Prevent caching issues

        this.filename = filename

        const [error] = await tryCatch(() => import(path))

        this.filename = null

        if (error) {
            this.logger.error(`failed to load routines from ${filename}`, error)
        }

        this.logger.debug('file loaded', { filename })
    }

    public async removeFile(filename: string) {
        const toRemove = this.routines.filter(routine => routine.data.filename === filename)

        for (const routine of toRemove) {
            this.routines = this.routines.filter(r => r !== routine)
        }

        this.logger.debug(`removed routes from ${filename}`)
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

        const child = this.logger.child({ 
            routineId: routine.id,
            routineCron: routine.cron
        })

        routine.job = nodeSchedule.scheduleJob(routine.cron, async () => {
            const [error] = await tryCatch(() => routine.handler())

            if (error) {
                child.error(error)
                return
            }

            child.info(`${routine.id} routine executed`)
        })

        child.info(`${routine.id} routine started`)
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

        this.logger.info(`${routine.id} routine stopped`)
    }

    public async remove(id: Routine['id']) {
        await this.stop(id)

        this.routines = this.routines.filter(r => r.id !== id)

        this.logger.info(`routine ${id} removed`)
    }

    public async stopAll() {
        for (const routine of this.routines) {
            await this.stop(routine.id)
        }
    }

    public async clear() {
        await this.stopAll()

        const count = this.routines.length
        
        this.routines = []

        this.logger.info('clear', { count: count })
    }

    public list() {
        return this.routines
    }
}
