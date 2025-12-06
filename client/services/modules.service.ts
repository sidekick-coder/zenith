import type Module from '#client/entities/module.entity.ts'
import logger from '#client/facades/logger.facade.ts'
import LoggerService from '#shared/services/logger.service.ts'

export default class ModulesService {
    public mods: Module[]
    public debug: boolean
    public logger: LoggerService

    constructor(data: Partial<ModulesService> = {}) {
        this.mods = []
        this.debug = data.debug ?? false
        this.logger = data.logger || logger.child({ label: 'modules' })

        if (this.debug) {
            this.logger.debug(`${this.constructor.name} service initalized in debug mode`)
        }
    }
    
    public async discover() {
        // implement discovery logic here
    }
    public async load() {
        // implement load logic here
    }
}