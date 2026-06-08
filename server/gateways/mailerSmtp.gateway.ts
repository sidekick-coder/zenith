import nodemailer from 'nodemailer'
import BaseMailer from './mailerBase.gateway.ts'

export default class MailerSMTP extends BaseMailer {
    public transporter: nodemailer.Transporter

    constructor(data: Pick<BaseMailer, 'id' | 'name' | 'description' | 'config'>) {
        super(data)

        this.transporter = nodemailer.createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.secure || false,
            auth: {
                user: this.config.username,
                pass: this.config.password,
            },
        })
    }

    public async verify(){
        return this.transporter.verify()
    }

    public send: BaseMailer['send'] = async (payload) => {
        await this.verify()

        const options = {
            from: payload.from || this.config.from,
            to: payload.to,
            subject: payload.subject,
            html: payload.body,
        }

        const result = await this.transporter.sendMail(options)

        return { result: result, }
    }
}
