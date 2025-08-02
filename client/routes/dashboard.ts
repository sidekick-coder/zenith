import authGuard from '#app/guards/auth.guard.ts'
import guestGuard from '#app/guards/guest.guard.ts'
import { autoRoutes } from '#app/utils/autoPages'

const pages = autoRoutes({
    basePath: 'admin',
    imports: import.meta.glob<any>('../pages/**/*.vue'),
    filterParts: ['pages'],
    onRegister: (record) => {
        if (record.path.startsWith('/admin/setup')) {
            record.beforeEnter = []
            return
        }

        if (record.path === '/admin/auth/login') {
            record.beforeEnter = [guestGuard]
            return
        }

        record.beforeEnter = [authGuard]
    }
})

pages.unshift({
    path: '/',
    redirect: '/admin',
})

export default pages
