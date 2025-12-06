import config from '#server/facades/config.facade.ts'
import LifecycleService from '#shared/services/lifecycle.service.ts'

const lifecycle = new LifecycleService({
    debug: config.get('lifecycle.debug') || config.get('app.debug')
})

export default lifecycle