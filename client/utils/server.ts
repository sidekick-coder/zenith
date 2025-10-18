import { $fetch } from './fetcher'
import { tryCatch } from '#shared/utils/tryCatch.ts'

async function waitTillOnline(timeout = 5000) {
    const start = Date.now()

    while (true) {
        const [error] = await tryCatch(() => $fetch('/api/health'))

        if (error) {
            return
        }

        if (Date.now() - start > timeout) {
            throw new Error('Timeout waiting for server to be online')
        }

        console.log('Server is online')

        break
    }
}

interface ReloadOptions {
    fn: Function
    href?: string
}

async function reloadAfter({ fn, href }: ReloadOptions) {
    const kill = () => { throw '(skipping full reload)' }

    if (import.meta.hot) {
        import.meta.hot.on('vite:beforeFullReload', kill)
        import.meta.hot.on('vite:beforeUpdate', kill)
    }

    await tryCatch(() => fn())
    await waitTillOnline()

    if (import.meta.hot) {
        import.meta.hot.off('vite:beforeFullReload', kill)
        import.meta.hot.off('vite:beforeUpdate', kill)
    }


    await new Promise(resolve => setTimeout(resolve, 5000))

    if (href) {
        window.location.href = href
        return
    }

    window.location.reload()
}

export const $server = {
    reloadAfter
}