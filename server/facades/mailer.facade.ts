import { container } from '@sidekick-coder/zenith-kit/server'
import MailerService from '#server/services/mailer.service.ts'

const mailer = container.proxy<MailerService>(MailerService)

export default mailer
