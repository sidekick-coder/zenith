import di from './di.facade.ts'
import ScheduleService from '#server/services/schedule.service.ts'

const key = 'scheduler'

di.set(key, new ScheduleService())

const scheduler = di.proxy<ScheduleService>(key)

export default scheduler
