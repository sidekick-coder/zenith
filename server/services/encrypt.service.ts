import crypto from 'crypto'

export default class EncryptService {
    public static readonly DI_KEY = 'encrypt'
    private readonly algorithm = 'aes-256-cbc'
    private key: Buffer

    constructor(secretKey?: string) {
        if (!secretKey) {
            throw new Error('Encryption key not set. Provide a secret key in the constructor.')
        }
        
        this.key = crypto.scryptSync(secretKey, 'salt', 32)
    }

    public encrypt(text: string) {
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv)
        
        let encrypted = cipher.update(text, 'utf8', 'hex')
        encrypted += cipher.final('hex')

        return `${iv.toString('hex')}:${encrypted}`
    }

    public decrypt(options: string): string {

        const [iv, encrypted] = options.split(':')

        const ivBuffer = Buffer.from(iv, 'hex')
        
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, ivBuffer)
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8')
        decrypted += decipher.final('utf8')

        return decrypted
    }
}