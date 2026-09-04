import assets from '#server/facades/assets.facade.ts'
import config from '#server/facades/config.facade.ts'

export default class BrandingService {
    public async load(){
        let lightVars = ''
        let darkVars = ''
        const branding = config.get('branding', {})

        for (const [key, value] of Object.entries(branding?.theme?.light || {})) {
            lightVars += `--${key}: ${value};\n`
        }

        for (const [key, value] of Object.entries(branding?.theme?.dark || {})) {
            darkVars += `--${key}: ${value};\n`
        }

        assets.set('branding', {
            content: `body { ${lightVars} } .dark body { ${darkVars} }`
        })
    }
}