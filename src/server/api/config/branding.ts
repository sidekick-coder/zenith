import { defineHandler, config } from '@sidekick-coder/zenith-kit/server'

export default defineHandler(async () => {
    const data = config.get('branding', {})

    if (data.logoFileId) {
        data.logoUrl = `/api/files/${data.logoFileId}/stream`
    }

    return data
})
