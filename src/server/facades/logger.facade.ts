import LoggerService from '@sidekick-coder/zenith-kit/shared/services/LoggerService'
import di from './di.facade.ts'

export const logger = di.proxy<LoggerService>(LoggerService)

/** @deprecated Please use @sidekick-coder/zenith-kit/shared */
export default logger
