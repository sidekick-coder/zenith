import { $fetch } from '#client/utils/index.ts'
import User from '#shared/entities/user.entity.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

interface LogoutOptions {
    redirect?: string
}

export default class AuthService {
    public user: User | null

    constructor(data: Partial<AuthService> = {}) {
        this.user = data.user || null
    }

    public async logout(options?: LogoutOptions): Promise<void> {
        const [error] = await tryCatch(() => $fetch('/auth/logout', { method: 'POST' }))

        if (error) {
            return
        }

        window.location.href = options?.redirect || '/'
    }
}
