import $fetch from '#client/facades/fetch.facade.ts'
import logger from '#client/facades/logger.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

interface OnlineOptions {
    timeout?: number
}

async function waitTillOnline(timeout = 5000) {
    const start = Date.now()

    while (true) {
        const [error] = await $fetch.try('/api/health')

        if (error) {
            return
        }

        if (Date.now() - start > timeout) {
            throw new Error('Timeout waiting for server to be online')
        }

        logger.info('server is online')

        break
    }
}

export async function online(options: OnlineOptions = {}) {
    const timeout = options.timeout ?? 5000
    const start = Date.now()

    while (true) {
        const [error] = await $fetch.try('/api/health')

        if (error) {
            return
        }

        if (Date.now() - start > timeout) {
            throw new Error('Timeout waiting for server to be online')
        }

        logger.info('server is online')

        break
    }
}

interface ReloadOptions {
    fn: Function
    href?: string
}

const kill = (event: any) => {
    event.preventDefault()

    throw '(skipping full reload)' 
}

export function trapHotReload() {
    if (!import.meta.hot) {
        return
    }
    
    import.meta.hot.on('vite:beforeFullReload', kill)
    import.meta.hot.on('vite:beforeUpdate', kill)

    logger.debug('Hot reload trapping enabled')
    
}

export async function untrapHotReload() {
    if (import.meta.hot) {
        import.meta.hot.off('vite:beforeFullReload', kill)
        import.meta.hot.off('vite:beforeUpdate', kill)
        logger.debug('Hot reload trapping disabled')
    }
}

async function reloadAfter({ fn, href }: ReloadOptions) {
    if (import.meta.hot) {
        import.meta.hot.on('vite:beforeFullReload', kill)
        import.meta.hot.on('vite:beforeUpdate', kill)
    }

    const [error] = await tryCatch(() => fn())

    if (error) {
        import.meta.hot?.off('vite:beforeFullReload', kill)
        import.meta.hot?.off('vite:beforeUpdate', kill)
        return false
    }

    await waitTillOnline()
    
    await new Promise(resolve => setTimeout(resolve, 5000))

    if (href) {
        window.location.href = href
        return true
    }

    window.location.reload()
    return true
}

export const $server = {
    reloadAfter,
    trapHot: trapHotReload,
    untrapHot: untrapHotReload,
    online: online,
}