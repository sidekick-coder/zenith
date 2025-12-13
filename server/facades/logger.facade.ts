import di from './di.facade.ts'
import LoggerService from '#shared/services/logger.service.ts'

di.set(LoggerService, new LoggerService())

export const logger = di.proxy<LoggerService>(LoggerService)

export default logger
