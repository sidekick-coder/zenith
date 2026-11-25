import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import generatePwaManifestFromConfig from '#server/services/pwaManifest.service.ts'

export default defineHandler(async () => {
    return generatePwaManifestFromConfig()
})
