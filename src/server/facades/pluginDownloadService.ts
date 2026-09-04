import { container } from '@sidekick-coder/zenith-kit/server'
import PluginDownloadService from '#server/services/PluginDownloadService.ts'

const pluginDownloadService = container.proxy<PluginDownloadService>(PluginDownloadService)

export default pluginDownloadService
