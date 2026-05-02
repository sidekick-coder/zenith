import { container } from '@sidekick-coder/zenith-kit/client'

if (import.meta.env.DEV) {
    globalThis.di = container
}

/** @deprecated use @sidekick-coder/zenith-kit's ContainerService instead */
export default container
