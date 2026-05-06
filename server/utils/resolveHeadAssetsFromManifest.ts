import { join } from 'path'
import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import type { ResolvableLink, ResolvableScript } from '@unhead/vue'
import type { ManifestChunk } from 'vite'

interface Options {
    manifest: Record<string, ManifestChunk>
    entry: string
    baseUrl?: string
}

interface Result {
    scripts: ResolvableScript[]
    links: ResolvableLink[]
}

export function resolveHeadAssetsFromManifest(optons: Options): Result {
    const manifest = optons.manifest
    const entry = optons.entry

    const chunk = manifest[entry]

    function resolveUrl(path: string): string {
        if (optons.baseUrl) {
            return join(optons.baseUrl, path)
        }

        return `/${path}`
    }

    if (!chunk) {
        throw new BaseException(`entry ${entry} not found in manifest`)
    }

    const scripts: ResolvableScript[] = []
    const links: ResolvableLink[] = []
    const visited = new Set<string>()

    const collectChunk = (key: string) => {
        if (visited.has(key)) return

        visited.add(key)

        const c = manifest[key]

        if (!c) return

        if (c.css) {
            for (const css of c.css) {
                links.push({
                    rel: 'stylesheet',
                    href: resolveUrl(css),
                })
            }
        }

        if (c.imports) {
            for (const imported of c.imports) {
                const importedChunk = manifest[imported]

                if (importedChunk) {
                    links.push({
                        rel: 'modulepreload',
                        href: resolveUrl(importedChunk.file),
                    })
                }

                collectChunk(imported)
            }
        }
    }

    collectChunk(entry)

    scripts.push({
        src: resolveUrl(chunk.file),
        type: 'module',
        defer: true,
    })

    return {
        scripts,
        links
    }
}
