import di from './di'
import type Router from '#router/router'

interface Options extends RequestInit {
 query?: Record<string, string>;
}

interface Fetcher {
    <T>(url: string, options?: Options): Promise<T>;
}

export async function defaultFetcher<T>(url: string, options: Options = {}): Promise<T> {
    const fetchOptions: RequestInit = {
        ...options
    }

    if (options.query) {
        const queryString = new URLSearchParams(options.query).toString()

        url += (url.includes('?') ? '&' : '?') + queryString
    }

    const response = await fetch(url, fetchOptions)

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json() as Promise<T>
}

export function createServerFetcher(router: Router) {
    async function fetcher<T>(url: string, options: Options = {}): Promise<T> {
        const isInternal = !url.startsWith('http://') && !url.startsWith('https://')

        if (!isInternal) {
            return defaultFetcher(url, options) as Promise<T>
        }

        const method = options.method || 'GET'

        const route = router.resolve(method, url)

        if (!route) {
            throw new Error(`Route not found for ${method} ${url}`)
        }

        const result = await route.handler({
            params: router.extractParams(route.path, url),
            query: options.query || router.extractQuery(url),
            body: options.body,
        })

        return result as Promise<T>
    }

    return fetcher
}

export async function $fetch<T>(url: string, options: Options = {}): Promise<T> {
    let fetcher: Fetcher = defaultFetcher

    if (di.has('fetcher')) {
        fetcher = di.get<Fetcher>('fetcher')
    }

    return fetcher<T>(url, options)
}