import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { config, drive } from '@sidekick-coder/zenith-kit/server'

export async function setupTestDrive(id: string) {
    const directory = await mkdtemp(join(tmpdir(), 'zenith-drive-'))

    config.set('drive.disks', {
        [id]: {
            name: 'Integration Test Drive',
            type: 'fs',
            config: { directory },
        },
    })
    config.set('drive.default', id)

    await drive.load()

    return directory
}

export async function cleanupTestDrive(directory: string) {
    await rm(directory, {
        recursive: true,
        force: true,
    })
    config.set('drive.disks', {})
    config.set('drive.default', undefined)
    await drive.load()
}
