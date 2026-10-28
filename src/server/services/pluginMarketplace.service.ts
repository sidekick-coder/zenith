import { readFile } from 'node:fs/promises'
import * as cacache from 'cacache'
import { dataPath, serverPath } from '@sidekick-coder/zenith-kit/server/utils/basePath'
import { load as loadYaml } from 'js-yaml'
import * as v from 'valibot'

const cacheDuration = 24 * 60 * 60 * 1000

const marketplaceSchema = v.object({
    items: v.array(v.object({
        repository: v.string(),
        branch: v.string(),
    })),
})

type MarketplaceItem = v.InferOutput<typeof marketplaceSchema>['items'][number]

export interface PluginMarketplaceEntry {
    repository: string
    branch: string
    hash?: string
    version?: string
    readme?: string
    packageJson?: Record<string, unknown>
    zenithConfig?: unknown
    error?: string
}

export interface PluginMarketplaceServiceOptions {
    marketplaceFilename?: string
    cachePath?: string
    fetch?: typeof globalThis.fetch
}

export default class PluginMarketplaceService {
    private marketplaceFilename: string
    private cachePath: string
    private fetch: typeof globalThis.fetch

    constructor(options: PluginMarketplaceServiceOptions = {}) {
        this.marketplaceFilename = options.marketplaceFilename
            ?? serverPath('resources/json/marketplace.json')
        this.cachePath = options.cachePath ?? dataPath('cache/plugin-marketplace')
        this.fetch = options.fetch ?? globalThis.fetch
    }

    public static create(options: PluginMarketplaceServiceOptions = {}) {
        return new PluginMarketplaceService(options)
    }

    public async list(): Promise<PluginMarketplaceEntry[]> {
        const marketplace = v.parse(
            marketplaceSchema,
            JSON.parse(await readFile(this.marketplaceFilename, 'utf8')),
        )

        return Promise.all(marketplace.items.map(async item => {
            try {
                return await this.getCached(item)
            } catch (error) {
                if (error instanceof Error) {
                    return {
                        repository: item.repository,
                        branch: item.branch,
                        error: error.message,
                    }
                }

                throw error
            }
        }))
    }

    private async getCached(item: MarketplaceItem): Promise<PluginMarketplaceEntry> {
        const key = `${item.repository}@${item.branch}`
        const cacheInfo = await cacache.get.info(this.cachePath, key)

        if (cacheInfo) {
            const cached = JSON.parse(
                (await cacache.get(this.cachePath, key)).data.toString('utf8'),
            ) as {
                entry: PluginMarketplaceEntry
                expiresAt: number
            }

            if (cached.expiresAt > Date.now()) {
                return cached.entry
            }
        }

        const entry = await this.get(item)

        await cacache.put(this.cachePath, key, JSON.stringify({
            entry,
            expiresAt: Date.now() + cacheDuration,
        }))

        return entry
    }

    private async get(item: MarketplaceItem): Promise<PluginMarketplaceEntry> {
        const { owner, repository } = this.getGitHubRepository(item.repository)
        const branch = encodeURIComponent(item.branch)
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repository}/${branch}`
        const repositoryUrl = `https://github.com/${owner}/${repository}`
        const resource = `${item.repository}@${item.branch}`

        const [readme, packageJsonContent, zenithConfigContent, commit] = await Promise.all([
            this.getText(`${rawUrl}/README.md`, 'README', resource),
            this.getText(`${rawUrl}/package.json`, 'package.json', resource),
            this.getText(`${rawUrl}/zenith.config.yml`, 'zenith.config.yml', resource),
            this.getText(`${repositoryUrl}/commit/${branch}.patch`, 'commit', resource),
        ])

        const packageJson = JSON.parse(packageJsonContent) as Record<string, unknown>
        const hash = /^From ([0-9a-f]{40}) /m.exec(commit)?.[1]

        if (Array.isArray(packageJson) || packageJson === null) {
            throw new Error(`Invalid package.json in ${resource}`)
        }

        if (!hash) {
            throw new Error(`Unable to read commit hash from ${resource}`)
        }

        return {
            repository: item.repository,
            branch: item.branch,
            hash,
            version: typeof packageJson.version === 'string' ? packageJson.version : undefined,
            readme,
            packageJson,
            zenithConfig: loadYaml(zenithConfigContent),
        }
    }

    private async getText(url: string, filename: string, resource: string): Promise<string> {
        const response = await this.fetch(url)

        if (!response.ok) {
            throw new Error(
                `Unable to fetch ${filename} from ${resource}: ${response.status} ${response.statusText}`,
            )
        }

        return response.text()
    }

    private getGitHubRepository(repository: string) {
        const url = new URL(repository)

        if (url.protocol !== 'https:' || url.hostname !== 'github.com') {
            throw new Error(`Marketplace repository must be an HTTPS GitHub URL: ${repository}`)
        }

        const path = url.pathname.replace(/^\/|\/$/g, '').replace(/\.git$/, '')
        const [owner, name, ...rest] = path.split('/')

        if (
            !owner
            || !name
            || rest.length > 0
            || !/^[A-Za-z0-9._-]+$/.test(owner)
            || !/^[A-Za-z0-9._-]+$/.test(name)
        ) {
            throw new Error(`Invalid GitHub repository URL: ${repository}`)
        }

        return {
            owner,
            repository: name,
        }
    }
}
