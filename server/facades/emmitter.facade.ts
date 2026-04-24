import { EmmitterService } from '@sidekick-coder/zenith-kit/server'
import di from './di.facade.ts'

const service = new EmmitterService()

di.set(EmmitterService, service)

const emmitter = di.proxy<EmmitterService>(EmmitterService)

export default emmitter
