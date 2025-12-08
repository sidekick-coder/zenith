import type { FetchOptions } from './fetch.service.ts'
import FetchService from './fetch.service.ts'
import RouterService from '#server/services/router.service.ts'
import CookieService from '#shared/services/cookie.service'
import Route from '#server/entities/route.entity.ts'
import di from '#client/utils/di.ts'
import config from '#client/facades/config.facade.ts'

export default class FetchNodeService extends FetchService {
    public async fetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const isInternal = !url.startsWith('http://') && !url.startsWith('https://')

        if (!isInternal) {
            return this.fetchExternal<T>(url, options)
        }

        return this.fetchInternal<T>(url, options)
    }

    protected async fetchExternal<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const fullUrl = this.buildUrl(url, options.query)
        const fetchOptions = this.buildRequestInit(options)

        const response = await fetch(fullUrl, fetchOptions)

        if (!response.ok) {
            await this.handleError(response)
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return this.parseResponse<T>(response)
    }

    protected async fetchInternal<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const router =  di.get<RouterService>(RouterService)
        const method = options.method || 'GET'
        const route = router.resolve(method, url)
        const cookie = new CookieService({
            prefix: config.get('cookie.prefix', '')
        })
        
        if (di.has('cookies')) {
            cookie.load(di.get<Record<string, string>>('cookies'))
        }

        if (!route || !route.handler) {
            throw new Error(`Route not found for ${method} ${url}`)
        }

        const result = await router.execute(route, {
            url: url,
            params: Route.params(route.path, url),
            query: options.query || Route.query(url),
            body: options.data || options.body,
            method: method.toLowerCase(),
            cookie: cookie
        })

        return result as Promise<T>
    }
}
