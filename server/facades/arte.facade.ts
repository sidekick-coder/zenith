import di from './di.facade.ts'
import ArteService from '#server/services/arte.service.ts'

const arte = di.proxy<ArteService>(ArteService)

export default arte

