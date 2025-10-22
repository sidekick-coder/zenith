import crypto from 'crypto'
import ms from 'ms'
import config from '#server/facades/config.facade.ts'
import env from '#server/env.ts'

interface URLOptions {
    data?: any;
    expires?: ms.StringValue;
    expireAt?: number | Date;
}

export default class EncryptService {
    public static readonly DI_KEY = 'encrypt'
    private readonly algorithm = 'aes-256-cbc'
    private key: Buffer | null = null

    public load(key: string) {
        this.key = crypto.scryptSync(key, 'salt', 32)
    }

    public encrypt(text: string) {
        if (!this.key) {
            throw new Error('Encryption key not set in configuration (app.key).')
        }

        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv)
        
        let encrypted = cipher.update(text, 'utf8', 'hex')
        encrypted += cipher.final('hex')

        return `${iv.toString('hex')}:${encrypted}`
    }

    public decrypt(options: string): string {
        if (!this.key) {
            throw new Error('Encryption key not set in configuration (app.key).')
        }

        const [iv, encrypted] = options.split(':')
        
        const ivBuffer = Buffer.from(iv, 'hex')
        
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, ivBuffer)
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8')
        decrypted += decipher.final('utf8')

        return decrypted
    }

    public url(path: string, options?: URLOptions): string {
        let expireAt = options?.expireAt
        
        if (options?.expires) {
            const expires = ms(options.expires) as number

            expireAt = Date.now() + expires
        }

        if (!expireAt) {
            expireAt = Date.now() + ms('15 minutes')
        }

        if (expireAt instanceof Date) {
            expireAt = expireAt.getTime()
        }

        const payload = {
            data: options?.data || {},
            expireAt
        }

        const key = this.encrypt(JSON.stringify(payload))

        const url = new URL(path, env.APP_URL)

        url.searchParams.append('key', encodeURIComponent(key))

        return url.toString()
    }

    public verifyUrl(encryptedKey: string): any {
        const decryptedData = this.decrypt(decodeURIComponent(encryptedKey))
        
        const payload = JSON.parse(decryptedData)

        if (payload.expireAt && Date.now() > payload.expireAt) {
            throw new Error('URL has expired')
        }

        return payload.data
    }
}