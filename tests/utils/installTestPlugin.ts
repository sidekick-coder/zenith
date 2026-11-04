import path from 'path'
import ZenithContainerStarted from '../entities/ZenithContainerStarted.ts'
import TestPlugin from '#tests/entities/TestPlugin.ts'

interface LoginOptions {
    container: ZenithContainerStarted
    plugin: TestPlugin
}

export async function installTestPlugin(options: LoginOptions) {
    const container = options.container
    const plugin = options.plugin

    // copy plugin folder to container
    await container.copyDirectoriesToContainer([
        {
            source: plugin.directory,
            target: path.join('/app/plugins', plugin.id)
        }
    ])
}
