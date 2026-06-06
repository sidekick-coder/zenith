import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { layout, router, route } from '@sidekick-coder/zenith-kit/client'

export default class extends LifecycleHook {
    public async register(): Promise<void> {
        const { AdminLayout } = await import('@sidekick-coder/zenith-kit/components')

        layout.add('admin', AdminLayout)
    }

    public async onLoad(): Promise<void> {
        layout.setCurrent(route.meta?.layout as string)

        router.beforeEach(async (to) => {
            layout.setCurrent(to.meta?.layout as string || null)

            return true
        })

    }
}
