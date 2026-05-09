import { config, PageRequestContextEntity } from '@sidekick-coder/zenith-kit/server'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import emmitter from '#server/facades/emmitter.facade.ts'

export default class extends LifecycleHook {
    public order = 3

    public async onPageRequest(ctx: PageRequestContextEntity): Promise<void> {
        ctx.head.push({
            title: config.get('site.name') || 'Zenith',
            htmlAttrs: {
                lang: config.get('translator.defaultLocale') || 'en',
                class: ctx.nodeState.get('preferences:dark_mode') ? 'dark' : 'light'
            },
            meta: [
                {
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1'
                },
            ],
            link: [
                {
                    rel: 'icon',
                    href: '/favicon'
                },
                {
                    rel: 'manifest',
                    href: '/pwa.json'
                },
                {
                    rel: 'stylesheet',
                    href: '/client/assets/styles.css'
                },
            ],
        })

        ctx.setBrowserState('site', config.get('site', {}))
        ctx.setBrowserState('branding', config.get('branding', {}))
        ctx.setBrowserState('auth', config.get('auth', {}))
        ctx.setConfigValue('setup', config.get('setup') || {})
    }

    public async register(): Promise<void> {
        emmitter.on('page:request:start', ctx => this.onPageRequest(ctx))
    }
}


