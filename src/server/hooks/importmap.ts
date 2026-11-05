import { emmitter, env } from '@sidekick-coder/zenith-kit/server'
import type { EventContract } from '@sidekick-coder/zenith-kit/server'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import type { ResolvableScript } from '@unhead/vue'

export default class extends LifecycleHook {
    public onRequest({ head }: EventContract['page:request:start']) {
        const scripts: ResolvableScript[] = []

        const imports = {
            'vue': '/api/vendor/vue.js',
            'vee-validate': '/api/vendor/vee-validate.js',
            'vue-router': '/api/vendor/vue-router.js',
        }

        if (env.development) {
            imports['vue'] = '/node_modules/vue/dist/vue.runtime.esm-bundler.js'
            imports['vue-router'] = '/node_modules/vue-router/dist/vue-router.js'
            imports['vee-validate'] = '/node_modules/vee-validate/dist/vee-validate.mjs'
        }

        scripts.push({
            type: 'importmap',
            innerHTML: JSON.stringify({ imports })
        })

        if (env.production) {
            scripts.push({
                innerHTML: `
                globalThis.process = {
                    env: {
                        NODE_ENV: 'production'
                    }
                }
            `
            })
        }



        head.push({ script: scripts as  any[] })
    }

    public async register(): Promise<void> {
        emmitter.on('page:request:start', ctx => this.onRequest(ctx))
    }
}
