
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import mailer from '#server/facades/mailer.facade.ts'

const command = new CliCommand('mailer:send')
    .need('mailer')
    .helpGroup('mailer')
    .requiredOption('-t, --to <to>', 'Recipient email address')
    .requiredOption('-s, --subject <subject>', 'Email subject')
    .requiredOption('-b, --body <body>', 'Email body')
    .action(async (options: { to: string; subject: string; body: string }) => {
        const result = await mailer.send(options)

        console.log(result)
    })

export default command
