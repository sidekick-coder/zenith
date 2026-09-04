import fs from 'fs/promises'
import { serverPath } from '#server/utils/paths.ts'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import { undeleted } from '#server/queries/softDelete.ts'

export default async function(): Promise<void> {
    const items = [
        {
            name: 'Welcome',
            subject: 'Welcome!',
            key: 'welcome',
            filename: serverPath('templates/emails/welcome.mjml'),
        },
        {
            name: 'Password Reset',
            subject: 'Password Reset Request',
            key: 'password_reset',
            filename: serverPath('templates/emails/password_reset.mjml'),
        },
        {
            name: 'Verify Email',
            subject: 'Verify Your Email Address',
            key: 'verify_email',
            filename: serverPath('templates/emails/verify_email.mjml'),
        },
    ]

    for await (const item of items) {
        const body = await fs.readFile(item.filename, 'utf-8')

        await EmailTemplate.firstOrCreate({
            where: eb => eb.and([
                eb('key', '=', item.key),
                undeleted(eb)
            ]),
            values: {
                name: item.name,
                subject: item.subject,
                key: item.key,
                body,
                engine: 'mjml'
            }
        })
    }
    
}
