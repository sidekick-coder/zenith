import ModulesService from './modules.service.ts'

export default class ModulesNodeService extends ModulesService {    
    public async discover() {
        // implement discovery logic here
        console.log('discovering modules in SSR...')
    }
    public async load() {
        // implement load logic here
    }
}