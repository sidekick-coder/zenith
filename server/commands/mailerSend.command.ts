
import mailer from '#server/facades/mailer.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte
    .command('mailer:send')
    .need('mailer')
    .helpGroup('mailer')
    .requiredOption('-t, --to <to>', 'Recipient email address')
    .requiredOption('-s, --subject <subject>', 'Email subject')
    .requiredOption('-b, --body <body>', 'Email body')
    .action(async (options: { to: string; subject: string; body: string }) => {
        const result = await mailer.send(options)

        console.log(result)
    })
