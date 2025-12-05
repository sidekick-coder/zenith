import config from './config.facade.ts'
import ModulesService from '#server/services/modules.service.ts'

const modules = new ModulesService({
    debug: config.get('modules.debug') || config.get('app.debug') || false
})

export default modules