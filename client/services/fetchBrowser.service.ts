import type { FetchOptions } from './fetch.service.ts'
import FetchService from './fetch.service.ts'

export default class FetchBrowserService extends FetchService {
    public async fetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const fullUrl = this.buildUrl(url, options.query)
        const fetchOptions = this.buildRequestInit(options)

        const response = await fetch(fullUrl, fetchOptions)

        if (!response.ok) {
            await this.handleError(response)
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return this.parseResponse<T>(response)
    }
}
