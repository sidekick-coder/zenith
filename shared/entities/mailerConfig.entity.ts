export const GATEWAYS = () => [
    {
        id: 'smtp',
        label: $t('SMTP'),
        description: $t('Send emails using the SMTP protocol.'),
        config_fields: {
            host: {
                component: 'text-field',
                label: $t('SMTP Host'),
            },
            port: {
                component: 'text-field',
                type: 'number',
                label: $t('SMTP Port'),
            },
            username: {
                component: 'text-field',
                label: $t('Username'),
            },
            password: {
                component: 'text-field',
                type: 'password',
                label: $t('Password'),
            },
            secure: {
                component: 'switch',
                label: $t('Use Secure Connection (TLS)'),
                hint: $t('Whether to use a secure TLS connection.'),
            },
        }
    },
]

export default class MailerConfig {
    public static get GATEWAYS() {
        return GATEWAYS()
    }
    
    public id: string
    public name: string
    public type: string
    public is_default: boolean
    public config: Record<string, any>

    constructor(data: MailerConfig){
        Object.assign(this, data)
    }

    public get config_fields() {
        const option = MailerConfig.GATEWAYS.find(opt => opt.id === this.type)

        return option ? option.config_fields : {}
    }
}