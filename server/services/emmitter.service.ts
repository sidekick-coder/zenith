import type { Events } from '#server/contracts/events.contract.ts'
import BaseService from '#shared/services/emmitter.service.ts'

export default class EmmiterService extends BaseService<Events> {}
