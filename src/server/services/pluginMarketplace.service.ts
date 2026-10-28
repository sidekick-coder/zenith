import { readFile } from 'node:fs/promises'
import { serverPath } from '@sidekick-coder/zenith-kit/server/utils/basePath'
import { load as loadYaml } from 'js-yaml'
import * as v from 'valibot'

const marketplaceSchema = v.object({
    items: v.array(v.object({
        repository: v.string(),
        branch: v.string(),
    })),
})

type MarketplaceItem = v.InferOutput<typeof marketplaceSchema>['items'][number]

interface GitHubContent {
    content: string
    encoding: string
}

interface GitHubCommit {
    sha: string
}

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
    fetch?: typeof globalThis.fetch
}

export default class PluginMarketplaceService {
    private marketplaceFilename: string
    private fetch: typeof globalThis.fetch

    constructor(options: PluginMarketplaceServiceOptions = {}) {
        this.marketplaceFilename = options.marketplaceFilename
            ?? serverPath('resources/json/marketplace.json')
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
                return await this.get(item)
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

    private async get(item: MarketplaceItem): Promise<PluginMarketplaceEntry> {
        const { owner, repository } = this.getGitHubRepository(item.repository)
        const branch = encodeURIComponent(item.branch)
        const apiUrl = `https://api.github.com/repos/${owner}/${repository}`
        const resource = `${item.repository}@${item.branch}`

        const [readme, packageJsonContent, zenithConfigContent, commit] = await Promise.all([
            this.getContent(`${apiUrl}/readme?ref=${branch}`, 'README', resource),
            this.getContent(`${apiUrl}/contents/package.json?ref=${branch}`, 'package.json', resource),
            this.getContent(`${apiUrl}/contents/zenith.config.yml?ref=${branch}`, 'zenith.config.yml', resource),
            this.getJson<GitHubCommit>(`${apiUrl}/commits/${branch}`, 'commit', resource),
        ])

        const packageJson = JSON.parse(packageJsonContent) as Record<string, unknown>

        if (Array.isArray(packageJson) || packageJson === null) {
            throw new Error(`Invalid package.json in ${resource}`)
        }

        return {
            repository: item.repository,
            branch: item.branch,
            hash: commit.sha,
            version: typeof packageJson.version === 'string' ? packageJson.version : undefined,
            readme,
            packageJson,
            zenithConfig: loadYaml(zenithConfigContent),
        }
    }

    private async getContent(url: string, filename: string, resource: string): Promise<string> {
        const content = await this.getJson<GitHubContent>(url, filename, resource)

        if (content.encoding !== 'base64') {
            throw new Error(`Unsupported ${filename} encoding in ${resource}: ${content.encoding}`)
        }

        return Buffer.from(content.content, 'base64').toString('utf8')
    }

    private async getJson<T>(url: string, filename: string, resource: string): Promise<T> {
        const response = await this.fetch(url, { headers: { Accept: 'application/vnd.github+json' }, })

        if (!response.ok) {
            throw new Error(
                `Unable to fetch ${filename} from ${resource}: ${response.status} ${response.statusText}`,
            )
        }

        return response.json() as Promise<T>
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
