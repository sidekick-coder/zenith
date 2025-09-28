import { $fetch } from '#client/utils/index.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

interface LogoutOptions {
    redirect?: string
}

async function logout(options?: LogoutOptions) {
    const [error] = await tryCatch(() =>  $fetch('/auth/logout', { method: 'POST', }))

    if (error) {
        return
    }

    window.location.href = options?.redirect || '/'
}

export const $auth = {
    logout,
}