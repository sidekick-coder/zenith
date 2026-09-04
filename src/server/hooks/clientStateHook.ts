import config from '@sidekick-coder/zenith-kit/server/facades/config'
import emmitter from '@sidekick-coder/zenith-kit/server/facades/emmitter'
import PageRequestContextEntity from '@sidekick-coder/zenith-kit/server/entities/PageRequestContextEntity'
import LifecycleHook from '@sidekick-coder/zenith-kit/shared/entities/LifecycleHook'

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
            ],
        })

        ctx.setBrowserState('site', config.get('site', {}))
        ctx.setBrowserState('branding', config.get('branding', {}))
        ctx.setConfigValue('setup', config.get('setup') || {})
        ctx.setConfigValue('emmitter.debug', emmitter.debug)
        ctx.setConfigValue('auth', config.get('auth', {}))
        ctx.setConfigValue('oauth', { google_enabled: config.get('oauth.google_enabled', false), })
    }

    public async register(): Promise<void> {
        emmitter.on('page:request:start', ctx => this.onPageRequest(ctx))
    }
}

