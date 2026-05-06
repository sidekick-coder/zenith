import { container } from '@sidekick-coder/zenith-kit/server'
import PluginManagerService from '#server/services/PluginManagerService.ts'

const pluginManager = container.proxy<PluginManagerService>(PluginManagerService)

export default pluginManager

