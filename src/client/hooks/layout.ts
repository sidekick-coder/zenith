import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { LayoutService, container, emmitter, router } from '@sidekick-coder/zenith-kit/client'
import { AdminLayout } from '@sidekick-coder/zenith-kit/components'

export default class extends LifecycleHook {
    public order = 11
    public async register(): Promise<void> {
        const layout = new LayoutService()

        container.set(LayoutService, layout)

        layout.add({
            id: 'admin',
            component: AdminLayout,
        })

        await emmitter.emitAndWait('layout:registered', { layout })

        const route = router.vueRouter.currentRoute

        layout.setCurrent(route.meta?.layout as string)
        layout.setOptions(route.meta?.layoutOptions || {})

        router.vueRouter.beforeEach(async (to, from) => {
            if (to.path === from.path) return true

            layout.setCurrent(to.meta?.layout as string || null)
            layout.setOptions(to.meta?.layoutOptions || {})

            return true
        })
    }

}
