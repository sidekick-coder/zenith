import { container } from '@sidekick-coder/zenith-kit/client'

if (import.meta.env.DEV) {
    globalThis.di = container
}

export default container
