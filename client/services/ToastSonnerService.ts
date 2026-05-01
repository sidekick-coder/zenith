import { toast } from 'vue-sonner'
import { ToastService } from '@sidekick-coder/zenith-kit/client'

export default class ToastSonnerService extends ToastService {

    public success(message: string): void {
        toast.success(message)
    }

    public error(message: string): void {
        toast.error(message)
    }

}
