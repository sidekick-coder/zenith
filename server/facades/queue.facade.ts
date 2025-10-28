import di from './di.facade.ts'
import QueueService from '#server/services/queue.service.ts'

const key = 'queue'

di.set(key, new QueueService())

const queue = di.proxy<QueueService>(key)

export default queue
