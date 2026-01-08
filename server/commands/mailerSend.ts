
import { program } from 'commander'
import mailer from '#server/facades/mailer.facade.ts'

program.command('mailer:send')
    .helpGroup('mailer')
    .requiredOption('-t, --to <to>', 'Recipient email address')
    .requiredOption('-s, --subject <subject>', 'Email subject')
    .requiredOption('-b, --body <body>', 'Email body')
    .action(async (options: { to: string; subject: string; body: string }) => {
        const result = await mailer.send(options)

        console.log(result)
    })