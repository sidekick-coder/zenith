import branding from './facades/branding.facade.ts'
import { defineServerSetup } from '#server/utils/defineServerSetup.ts'
import modules from '#server/services/modules.service.ts'

export default defineServerSetup(async ({ assets }) => {

    const mods = await modules.list({
        enabled: true,
    })
    
    mods.forEach(mod => {
        const modAssets = mod.files.filter(f => f.type === 'asset')

        modAssets.forEach(a => {
            assets.set(`module:${mod.id}:${a.src}`, {
                src: a.src,
            })
        })
    })

    await branding.load()

})