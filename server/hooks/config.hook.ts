import di from '#server/facades/di.facade.ts'
import env from '#server/facades/env.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import ConfigFSService from '#server/services/configFS.service.ts'
import ConfigS3Service from '#server/services/configS3.service.ts'
import { configPath } from '#server/utils/paths.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import ConfigService from '#shared/services/config.service.ts'
import { flatten } from '#shared/utils/flatten.ts'

export default class ConfigLifecycleHook extends LifecycleHook {
    public order = 1
    public async onRegister(): Promise<void> {
        let service: ConfigService | null = null

        if (env.get('CONFIG_DRIVER') === 's3') {
            const s3 = new ConfigS3Service({
                bucket: env.get('CONFIG_S3_BUCKET')!,
                region: env.get('CONFIG_S3_REGION')!,
                accessKeyId: env.get('CONFIG_S3_ACCESS_KEY_ID')!,
                secretAccessKey: env.get('CONFIG_S3_SECRET_ACCESS_KEY')!,
                debug: env.get('CONFIG_DEBUG'),
                endpoint: env.get('CONFIG_S3_ENDPOINT'),
                prefix: env.get('CONFIG_S3_PREFIX'),
                sessionToken: env.get('CONFIG_S3_SESSION_TOKEN'),
                logger: logger.child({ label: 'config' }),
            })

            await s3.load()

            service = s3

            logger.child({ label: 'config' }).info('using S3 configuration service', {
                bucket: env.get('CONFIG_S3_BUCKET'),
                region: env.get('CONFIG_S3_REGION'),
                prefix: env.get('CONFIG_S3_PREFIX'),
            })
        }

        if (!service) {
            const configFS = new ConfigFSService({
                directory: configPath(),
                debug: env.get('CONFIG_DEBUG'),
                logger: logger.child({ label: 'config' }),
            })

            await configFS.load()

            service = configFS

            logger.child({ label: 'config' }).info('using filesystem configuration service', { file: configPath(), })
        }

        if (!service) {
            throw new Error('Failed to initialize configuration service')
        }

        
        di.set(ConfigService, service)

        const envEntries = flatten(env.get('CONFIG') || {})

        for (const [key, value] of Object.entries(envEntries)) {
            service.set(key, value, 'env')
        }
    }
}
