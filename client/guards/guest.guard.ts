import di from '#client/utils/di.ts'

export interface GuestGuardOptions {
    redirect: string
}

export function createGuestGuard(options: GuestGuardOptions) {
    return () => {
        const user = di.get<any>('auth:user')

        if (user) {
            return options.redirect
        }
    }
}

const guestGuard = createGuestGuard({
    redirect: '/'
})

export default guestGuard