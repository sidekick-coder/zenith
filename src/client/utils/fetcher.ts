import { toast } from 'vue-sonner'
import di from './di'
import type Router from '#server/services/router.service.ts'
import CookieService from '#shared/services/cookie.service'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Route from '#server/entities/route.entity.ts'

interface Options extends RequestInit {
    query?: Record<string, any>
    data?: Record<string, any>
}
    
interface Fetcher {
    <T>(url: string, options?: Options): Promise<T>;
}

async function handleError(response: Response) {    
    const contentType = response.headers.get('Content-Type') || ''

    if (!contentType.includes('application/json')) {
        return toast.error($t('Internal Server Error'))
    }

    if (response.headers.get('Content-Type')?.includes('json')) {
        const data = await response.json()
            .catch(() => ({ message: $t('Internal Server Error') }))
    
        if (data.message) {
            toast.error(data.message)
        }    
    }

}

export async function defaultFetcher<T>(url: string, options: Options = {}): Promise<T> {
    const fetchOptions: RequestInit = { ...options }

    if (options.query) {
        const queryString = new URLSearchParams(options.query).toString()

        url += (url.includes('?') ? '&' : '?') + queryString
    }

    if (options.data) {
        fetchOptions.body = JSON.stringify(options.data)
        fetchOptions.headers = {
            ...fetchOptions.headers,
            'Content-Type': 'application/json',
        }
    }

    const response = await fetch(url, fetchOptions)

    if (!response.ok) {
        await handleError(response)
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (response.headers.get('Content-Type')?.includes('json')) {
        return response.json() as Promise<T>
    }

    return response.text() as Promise<T>
}

export function createServerFetcher(router: Router, cookies: Record<string, string> = {}): Fetcher {
    async function fetcher<T>(url: string, options: Options = {}): Promise<T> {
        const isInternal = !url.startsWith('http://') && !url.startsWith('https://')

        if (!isInternal) {
            return defaultFetcher(url, options) as Promise<T>
        }

        const method = options.method || 'GET'

        const route = router.resolve(method, url)

        if (!route || !route.handler) {
            throw new Error(`Route not found for ${method} ${url}`)
        }

        const result = await router.execute(route,{
            params: Route.params(route.path, url),
            query: options.query || Route.query(url),
            body: options.data || options.body,
            url: url,
            method: method.toLowerCase(),
            // file,
            // files,
            cookie: new CookieService(cookies)
        })
        

        return result as Promise<T>
    }

    return fetcher
}

export async function $fetch<T = any>(url: string, options: Options = {}): Promise<T> {
    let fetcher: Fetcher = defaultFetcher

    if (di.has('fetcher')) {
        fetcher = di.get<Fetcher>('fetcher')
    }

    return fetcher<T>(url, options)
}

$fetch.try = async function<T = any>(url: string, options: Options = {}) {
    return tryCatch(() => $fetch<T>(url, options))
}