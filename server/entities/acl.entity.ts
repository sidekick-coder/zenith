import BaseAcl from '#shared/entities/acl.entity.ts'
import BaseException from '#server/exceptions/base.ts'

export default class Acl extends BaseAcl {
    public authorize(action: string, subject: any, object?: Record<string, any>) {
        if (this.cannot(action, subject, object)) {
            throw new BaseException('Unauthorized', 403)
        }
    }
}