import type { ConfigLoader } from './config.service.ts'

export default class ConfigS3Loader implements ConfigLoader {
    public async load() {
        return {}
    }
}