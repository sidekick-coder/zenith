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

async function reloadAfter(fn: Function) {
    const kill = () => { throw '(skipping full reload)' }

    if (import.meta.hot) {
        import.meta.hot.on('vite:beforeFullReload', kill)
        import.meta.hot.on('vite:beforeUpdate', kill)
    }

    await tryCatch(() => fn())

    if (import.meta.hot) {
        import.meta.hot.off('vite:beforeFullReload', kill)
        import.meta.hot.off('vite:beforeUpdate', kill)
    }

    await waitTillOnline()

    if (import.meta.hot) {
        return import.meta.hot.invalidate()
    }

    window.location.reload()
}

export const $server = {
    reloadAfter
}