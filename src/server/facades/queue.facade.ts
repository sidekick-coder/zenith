import di from './di.facade.ts'
import QueueService from '#server/services/queue.service.ts'

const queue = di.proxy<QueueService>(QueueService)

export default queue
