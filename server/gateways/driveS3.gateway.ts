import { Readable } from 'stream'
import ms from 'ms'
import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Upload } from '@aws-sdk/lib-storage'
import DriveEntity from '#shared/entities/driveEntry.entity.ts'
import BaseDrive from '#server/gateways/driveBase.gateway.ts'
import validator from '#shared/services/validator.service.ts'

export interface S3DriveConfig {
    bucket: string
    region?: string
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
    endpoint?: string
}

function streamToUint8Array(stream: any): Promise<Uint8Array> {
    if (!stream || typeof stream !== 'object' || typeof stream.on !== 'function') {
        return Promise.resolve(new Uint8Array())
    }

    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        stream.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)))
        stream.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))))
        stream.on('error', reject)
    })
}

export default class S3Drive extends BaseDrive {
    protected bucket: string
    protected client: S3Client

    constructor(data: Pick<BaseDrive, 'id' | 'name' | 'description' | 'config'>) {
        super(data)

        const config = this.validateConfig(data.config)

        this.bucket = config.bucket

        this.client = new S3Client({
            region: config.region,
            endpoint: config.endpoint,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
                sessionToken: config.sessionToken,
            }
        })
    }

    private validateConfig(config: Record<string, any>): S3DriveConfig {
        return validator.validate(config, (v) => v.object({
            bucket: v.pipe(v.string(), v.minLength(1)),
            region: v.optional(v.string()),
            accessKeyId: v.pipe(v.string(), v.minLength(1)),
            secretAccessKey: v.pipe(v.string(), v.minLength(1)),
            sessionToken: v.optional(v.string()),
            endpoint: v.optional(v.string()),
        }))
    }

    public exists: BaseDrive['exists'] = async (filename) => {
        const Key = filename.startsWith('/') ? filename.slice(1) : filename

        return this.client.send(new HeadObjectCommand({ Bucket: this.bucket,
            Key }))
            .then(() => true)
            .catch(() => false)
    }

    public list: BaseDrive['list'] = async (folder) => {
        const Prefix = folder ? (folder.startsWith('/') ? folder.slice(1) : folder) : undefined

        const resp = await this.client.send(new ListObjectsV2Command({ Bucket: this.bucket,
            Prefix }))

        const entries: DriveEntity[] = []

        const contents = resp.Contents || []

        for (const obj of contents) {
            const key = obj.Key || ''

            const isDirectory = key.endsWith('/')

            const entry = new DriveEntity({
                name: key.split('/').pop() || key,
                path: '/' + key,
                type: isDirectory ? 'directory' : 'file',
                metas: {
                    size: obj.Size,
                    mimetype: undefined,
                }
            })

            entries.push(entry)
        }

        return entries
    }

    public find: BaseDrive['find'] = async (filename) => {
        const filepath = filename.startsWith('/') ? filename : '/' + filename

        const entries = await this.list(filepath.startsWith('/') ? filepath.slice(1).replace(/\\/g, '/') : filepath)

        const entry = entries.find(e => e.path === filepath)

        if (!entry) {
            throw new Error(`File "${filepath}" not found`)
        }

        return entry
    }

    public async mkdir(_filename: string): Promise<void> {
        // S3 is object storage; directories are implicit. Create a zero-byte object with trailing slash to emulate directory if needed.
        return Promise.resolve()
    }

    public read: BaseDrive['read'] = async (filename) => {
        const Key = filename.startsWith('/') ? filename.slice(1) : filename

        const resp = await this.client.send(new GetObjectCommand({
            Bucket: this.bucket,
            Key 
        }))

        const body = resp.Body as Readable

        return streamToUint8Array(body)
    }

    public async readStream(filename: string) {
        const Key = filename.startsWith('/') ? filename.slice(1) : filename

        const command = new GetObjectCommand({ 
            Bucket: this.bucket,
            Key 
        })

        const resp = await this.client.send(command)

        const body = resp.Body as any

        return Promise.resolve(body)
    }

    public write: BaseDrive['write'] = async (filename, data) => {
        const Key = filename.startsWith('/') ? filename.slice(1) : filename

        await this.client.send(new PutObjectCommand({ 
            Bucket: this.bucket,
            Key,
            Body: Buffer.from(data) 
        }))
    }

    public async writeStream(filename: string, stream: NodeJS.ReadableStream): Promise<void> {
        const Key = filename.startsWith('/') ? filename.slice(1) : filename

        const upload = new Upload({
            client: this.client,
            params: {
                Bucket: this.bucket,
                Key,
                Body: Readable.from(stream),
            },
        })

        await upload.done()
    }

    public delete: BaseDrive['delete'] = async (filename) => {
        const Key = filename.startsWith('/') ? filename.slice(1) : filename

        if (Key.endsWith('/')) {
            const resp = await this.client.send(new ListObjectsV2Command({ Bucket: this.bucket,
                Prefix: Key }))

            const toDelete = (resp.Contents || []).map(c => ({ Key: c.Key }))

            if (toDelete.length === 0) {
                return
            }

            await this.client.send(new DeleteObjectsCommand({ Bucket: this.bucket,
                Delete: { Objects: toDelete } }))

            return
        }

        await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket,
            Key }))
    }

    public url: BaseDrive['url'] = async (filename, options) => {
        const Key = filename.startsWith('/') ? filename.slice(1) : filename

        const expiresMs = ms(options?.expires || '30m') || 30 * 60 * 1000
        const expiresSeconds = Math.max(1, Math.round(expiresMs / 1000))

        return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket,
            Key }), { expiresIn: expiresSeconds })
    }

    public uploadUrl: BaseDrive['uploadUrl'] = async (filename, options) => {
        const Key = filename.startsWith('/') ? filename.slice(1) : filename

        const expiresMs = ms(options?.expires || '30m') || 30 * 60 * 1000
        const expiresSeconds = Math.max(1, Math.round(expiresMs / 1000))

        return getSignedUrl(this.client, new PutObjectCommand({ Bucket: this.bucket,
            Key }), { expiresIn: expiresSeconds })
    }
}
