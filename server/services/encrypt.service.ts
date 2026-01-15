import crypto from 'crypto'
import ms from 'ms'
import { format } from 'date-fns'
import env from '#server/facades/env.facade.ts'
import BaseException from '#server/exceptions/base.ts'

interface URLOptions {
    data?: any;
    expires?: ms.StringValue;
    expireAt?: number | Date;
}

interface LoadOptions {
    key: string;
    debug?: boolean;
}

export default class EncryptService {
    private readonly algorithm = 'aes-256-cbc'
    private key: Buffer | null = null
    private debug = false

    public load(options: LoadOptions) {
        this.debug = options.debug ?? this.debug
        this.key = crypto.scryptSync(options.key, 'salt', 32)
    }

    public encrypt(text: string) {
        if (!this.key) {
            throw new Error('Encryption key not set')
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

    public encryptObject(obj: any): string {
        const jsonString = JSON.stringify(obj)

        return this.encrypt(jsonString)
    }

    public decryptObject<T>(encryptedString: string): T {
        const jsonString = this.decrypt(encryptedString)

        return JSON.parse(jsonString) as T
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
            expireAt,
            expireAtReadable: format(new Date(expireAt), 'yyyy-MM-dd HH:mm:ss')
        }

        const key = this.encrypt(JSON.stringify(payload))

        const url = new URL(path, env.get('APP_URL'))

        url.searchParams.append('key', encodeURIComponent(key))

        return url.toString()
    }

    public verifyUrl(encryptedKey: string): any {
        const decryptedData = this.decrypt(decodeURIComponent(encryptedKey))
        
        const payload = JSON.parse(decryptedData)

        if (payload.expireAt && Date.now() > payload.expireAt) {
            const error = new BaseException('URL has expired', 403)

            Object.assign(error, {
                expireAt: payload.expireAt,
                expireAtReadable: payload.expireAtReadable
            })
            
            throw error
        }

        return payload.data
    }
}