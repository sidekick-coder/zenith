import { EmmitterService } from '@sidekick-coder/zenith-kit/server'
import di from './di.facade.ts'

const emmitter = di.proxy<EmmitterService>(EmmitterService)

export default emmitter
