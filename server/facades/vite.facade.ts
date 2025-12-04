import di from './di.facade.ts'
import ViteService from '#server/services/vite.service.ts'

const vite = di.proxy<ViteService>(ViteService.name)

export default vite