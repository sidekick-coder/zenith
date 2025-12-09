import config from './config.facade.ts'
import ShellService from '#server/services/shell.service.ts'

const shell = new ShellService({
    debug: config.get('shell.debug', false) || config.get('app.debug', false),
})

export default shell