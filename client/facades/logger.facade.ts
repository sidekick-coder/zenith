import ClientLoggerService from '#client/services/logger.service'
import di from '#client/utils/di.ts'

const client = new ClientLoggerService()

di.set('logger', client)

const logger = di.proxy<ClientLoggerService>('logger')

export default logger
