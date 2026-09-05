
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import auth from '#server/facades/auth.facade.ts'
import logger from '#server/facades/logger.facade.ts'

const command = new CliCommand('user:forget-password')
    .helpGroup('user')
    .requiredOption('-e, --email <email>', 'User email address')
    .action(async (options: { email: string }) => {
        await auth.forgetPassword(options.email)

        logger.info(`Password reset email sent to ${options.email}`)
    })

export default command
