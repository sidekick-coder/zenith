import { tryCatch } from '#shared/utils/tryCatch.ts'

interface FetcherOptions {
    headers?: Record<string, string>
    timeout?: number
}

interface RequestOptions extends FetcherOptions {
    params?: Record<string, string>
    body?: unknown
}

interface FetcherResponse<T> {
    body: T
    headers: Headers
    status: number
}

type FetcherResult<T> = FetcherResponse<T>

export default class FetcherService {
    private baseUrl: string
    private defaultHeaders: Record<string, string>
    private timeout: number

    constructor(baseUrl?: string, options?: FetcherOptions) {
        this.baseUrl = baseUrl || ''
        this.defaultHeaders = options?.headers ?? {}
        this.timeout = options?.timeout ?? 30000
    }

    public setBaseUrl(url: string) {
        this.baseUrl = url
    }

    public getBaseUrl() {
        return this.baseUrl
    }

    public setDefaultHeaders(headers: Record<string, string>) {
        this.defaultHeaders = headers
    }

    public addDefaultHeader(key: string, value: string) {
        this.defaultHeaders[key] = value
    }

    private buildUrl(path: string, params?: Record<string, string>) {
        const url = new URL(path, this.baseUrl)

        if (params) {
            for (const [key, value] of Object.entries(params)) {
                url.searchParams.set(key, value)
            }
        }

        return url.toString()
    }

    public async request<T>(method: string, path: string, options?: RequestOptions): FetcherResult<T> {
        const url = this.buildUrl(path, options?.params)

        const headers: Record<string, string> = {
            ...this.defaultHeaders,
            ...options?.headers,
        }

        if (options?.body && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json'
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? this.timeout)

        const response = await fetch(url, {
            method,
            headers,
            body: options?.body ? JSON.stringify(options.body) : undefined,
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        const contentType = response.headers.get('Content-Type')

        const body: T = contentType?.includes('application/json') 
            ? await response.json() as T
            : await response.text() as unknown as T

        return {
            body,
            headers: response.headers,
            status: response.status,
        }
    }

    public get<T>(path: string, options?: Omit<RequestOptions, 'body'>): FetcherResult<T> {
        return this.request<T>('GET', path, options)
    }

    public post<T>(path: string, body?: unknown, options?: RequestOptions): FetcherResult<T> {
        return this.request<T>('POST', path, {
            ...options,
            body,
        })
    }

    public put<T>(path: string, body?: unknown, options?: RequestOptions): FetcherResult<T> {
        return this.request<T>('PUT', path, {
            ...options,
            body,
        })
    }

    public patch<T>(path: string, body?: unknown, options?: RequestOptions): FetcherResult<T> {
        return this.request<T>('PATCH', path, {
            ...options,
            body,
        })
    }

    public delete<T>(path: string, options?: RequestOptions): FetcherResult<T> {
        return this.request<T>('DELETE', path, options)
    }

    public head<T>(path: string, options?: Omit<RequestOptions, 'body'>): FetcherResult<T> {
        return this.request<T>('HEAD', path, options)
    }
}
