export const TYPES = [
    {
        id: 'fs',
        label: $t('File System'),
        description: $t('Store files on the local file system.'),
        config_fields: {
            directory: {
                component: 'text-field',
                label: $t('Directory'),
                description: $t('The directory path where files will be stored.'),
                hint: $t('Relative to the application root or absolute path, e.g., :0  or :1', ['/var/zenith/uploads', 'storage/uploads']),
            }
        }
    },
    {
        id: 's3',
        label: $t('Amazon S3'),
        description: $t('Store files on Amazon S3 cloud storage.'),
        config_fields: {
            accessKeyId: {
                component: 'text-field',
                label: $t('Access Key ID'),
                hint: $t('Your AWS access key ID.'),
            },
            secretAccessKey: {
                component: 'text-field',
                label: $t('Secret Access Key'),
                hint: $t('Your AWS secret access key.'),
            },
            bucket: {
                component: 'text-field',
                label: $t('Bucket Name'),
                hint: $t('The name of the S3 bucket to store files in.'),
            },
            region: {
                component: 'text-field',
                label: $t('Region'),
                hint: $t('The AWS region where your bucket is located.'),
            }
        }
    }
]
export default class DriveConfig {
    public static TYPES = TYPES
    public id: string
    public name: string
    public type: string
    public config: Record<string, any>

    constructor(data: DriveConfig){
        Object.assign(this, data)
    }

    public get config_fields() {
        const option = TYPES.find(opt => opt.id === this.type)

        return option ? option.config_fields : {}
    }
}