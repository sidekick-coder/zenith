import { container, ToastService } from '@sidekick-coder/zenith-kit/client'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import ToastSonnerService from '#client/services/ToastSonnerService.ts'

export default class ToastHook extends LifecycleHook {
    public async onRegister(): Promise<void> {

        const toast = new ToastSonnerService()

        container.set(ToastService , toast)
    }
}
