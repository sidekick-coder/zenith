import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PluginMarketplaceService from './pluginMarketplace.service.ts'

describe('PluginMarketplaceService', () => {
    const directories: string[] = []

    afterEach(async () => {
        await Promise.all(directories.splice(0).map(directory => rm(directory, {
            recursive: true,
            force: true,
        })))
    })

    it('returns repository metadata from the marketplace branch', async () => {
        const directory = await mkdtemp(path.join(tmpdir(), 'zenith-marketplace-'))
        directories.push(directory)

        const marketplaceFilename = path.join(directory, 'marketplace.json')
        await writeFile(marketplaceFilename, JSON.stringify({
            items: [{
                repository: 'https://github.com/acme/example.git',
                branch: 'release',
            }],
        }))

        const fetch = vi.fn(async (url: string) => {
            if (url.endsWith('/README.md')) {
                return new Response('# Example')
            }

            if (url.endsWith('/package.json')) {
                return new Response('{"name":"example","version":"1.2.3"}')
            }

            if (url.endsWith('/zenith.config.yml')) {
                return new Response('id: example')
            }

            return new Response('From aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa Mon Sep 17 00:00:00 2001')
        })

        const entries = await PluginMarketplaceService.create({
            marketplaceFilename,
            cachePath: path.join(directory, 'cache'),
            fetch: fetch as typeof globalThis.fetch,
        }).list()

        expect(entries).toEqual([{
            repository: 'https://github.com/acme/example.git',
            branch: 'release',
            hash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            version: '1.2.3',
            readme: '# Example',
            packageJson: {
                name: 'example',
                version: '1.2.3',
            },
            zenithConfig: { id: 'example' },
        }])

        await PluginMarketplaceService.create({
            marketplaceFilename,
            cachePath: path.join(directory, 'cache'),
            fetch: fetch as typeof globalThis.fetch,
        }).list()

        expect(fetch).toHaveBeenCalledTimes(4)
        expect(fetch).toHaveBeenCalledWith(
            'https://raw.githubusercontent.com/acme/example/release/README.md',
        )
        expect(fetch).toHaveBeenCalledWith(
            'https://github.com/acme/example/commit/release.patch',
        )
    })

    it('rejects marketplace entries outside GitHub', async () => {
        const directory = await mkdtemp(path.join(tmpdir(), 'zenith-marketplace-'))
        directories.push(directory)

        const marketplaceFilename = path.join(directory, 'marketplace.json')
        await writeFile(marketplaceFilename, JSON.stringify({
            items: [{
                repository: 'https://example.com/acme/example.git',
                branch: 'main',
            }],
        }))

        await expect(PluginMarketplaceService.create({ marketplaceFilename }).list())
            .resolves.toEqual([{
                repository: 'https://example.com/acme/example.git',
                branch: 'main',
                error: 'Marketplace repository must be an HTTPS GitHub URL: https://example.com/acme/example.git',
            }])
    })
})
