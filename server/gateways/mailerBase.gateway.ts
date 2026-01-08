export interface MailerSendPayload {
    to: string
    subject: string
    body: string
}
export default class BaseMailer {
    public id: string
    public name: string
    public description?: string
    public config: Record<string, any> = {}

    constructor(data: Pick<BaseMailer, 'id' | 'name' | 'description' | 'config'>) {
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.config = data.config
    }

    public send(payload: MailerSendPayload): Promise<void> {
        const error = new Error('Method not implemented.')

        Object.assign(error, payload)

        throw error
    }
}