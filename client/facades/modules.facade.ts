import ModulesService from '#client/services/modules.service.ts'
import di from '#client/utils/di.ts'

const modules = di.proxy<ModulesService>(ModulesService)

export default modules
