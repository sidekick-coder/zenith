import auth from '#client/facades/auth.facade.ts'

export interface GuestGuardOptions {
    redirect: string
}

export function createGuestGuard(options: GuestGuardOptions) {
    return () => {
        if (auth.user) {
            return options.redirect
        }
    }
}

const guestGuard = createGuestGuard({
    redirect: '/'
})

export default guestGuard