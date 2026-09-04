import { LoggerService } from '@sidekick-coder/zenith-kit/shared'
import di from './di.facade.ts'

export const logger = di.proxy<LoggerService>(LoggerService)

export default logger
