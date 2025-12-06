import logger from '#client/facades/logger.facade.ts'
import config from '#client/facades/config.facade.ts'
import LifecycleService from '#shared/services/lifecycle.service.ts'

const lifecycle = new LifecycleService({
    debug: config.get('lifecycle.debug') || config.get('app.debug'),
    logger: logger.child({ label: 'lifecycle' }),
})

export default lifecycle