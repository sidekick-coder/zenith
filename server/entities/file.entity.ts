import ms from 'ms'
import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/file.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import { Metadata } from '#server/mixins/metadata.mixin.ts'
import drive from '#server/facades/drive.facade.ts'
import { Hooks } from '#server/mixins/hooks.mixin.ts'
import type { DriveUrlOptions } from '#server/contracts/drive.contract.ts'

interface URLCache {
    url: string
    expires: number
}

export default class File extends composeWith(
    Base,
    Hooks,
    Model('files'),
    Metadata('file_metas', 'file_id')
) {

    public static cache = new Map<string, URLCache>()

    public static boot(){
        this.on('serialized', async (file: File) => {
            file.url = await drive.url(file.filename)
        })
    }

    public static async has(filename: string): Promise<boolean> {
        const exists = await this.exists({
            query: q => q.where('filename', '=', filename)
        })

        return exists
    }

    public static async findByFilename(filename: string) {
        return await this.findOne({
            where: qb => qb('filename', '=', filename)
        })
    }

    public readStream() {
        return drive.use(this.drive).readStream(this.filename)
    }

    public async loadUrl(options: DriveUrlOptions = {}) {
        const cache = File.cache.get(this.filename)
        const now = Date.now()

        if (cache && now < cache.expires) {
            this.url = cache.url
            return
        }

        if (!options.expires) {
            options.expires = '1h'
        }
        
        this.url = await drive.use(this.drive).url(this.filename, options)
        
        if (!this.url) {
            return
        }

        const expires = now + ms(options.expires) - 1000 // 1 second early

        File.cache.set(this.filename, {
            url: this.url,
            expires
        })
    }

    public async deleteFromDrive() {
        await drive.use(this.drive).delete(this.filename)
    }
}