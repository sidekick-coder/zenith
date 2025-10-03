import crypto from 'crypto'
import config from '#server/facades/config.facade.ts'

export default class EncryptService {
    public static readonly DI_KEY = 'encrypt'
    private readonly algorithm = 'aes-256-cbc'
    private key: Buffer

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
}