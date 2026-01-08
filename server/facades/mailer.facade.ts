import di from './di.facade.ts'
import MailerService from '#server/services/mailer.service.ts'

const mailer = di.proxy<MailerService>(MailerService)

export default mailer