import di from './di.facade.ts'
import ViteService from '#server/services/ViteService.ts'

const vite = di.proxy<ViteService>(ViteService)

export default vite
