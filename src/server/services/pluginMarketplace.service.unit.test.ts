import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PluginMarketplaceService from './pluginMarketplace.service.ts'

const encode = (value: string) => Buffer.from(value).toString('base64')

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
            if (url.endsWith('/readme?ref=release')) {
                return new Response(JSON.stringify({
                    encoding: 'base64',
                    content: encode('# Example'),
                }))
            }

            if (url.endsWith('/contents/package.json?ref=release')) {
                return new Response(JSON.stringify({
                    encoding: 'base64',
                    content: encode('{"name":"example","version":"1.2.3"}'),
                }))
            }

            if (url.endsWith('/contents/zenith.config.yml?ref=release')) {
                return new Response(JSON.stringify({
                    encoding: 'base64',
                    content: encode('id: example'),
                }))
            }

            return new Response(JSON.stringify({ sha: 'abc123' }))
        })

        const entries = await PluginMarketplaceService.create({
            marketplaceFilename,
            fetch: fetch as typeof globalThis.fetch,
        }).list()

        expect(entries).toEqual([{
            repository: 'https://github.com/acme/example.git',
            branch: 'release',
            hash: 'abc123',
            version: '1.2.3',
            readme: '# Example',
            packageJson: {
                name: 'example',
                version: '1.2.3',
            },
            zenithConfig: { id: 'example' },
        }])
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
