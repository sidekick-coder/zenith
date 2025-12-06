import di from '#client/utils/di.ts'
import type Acl from '#shared/entities/acl.entity.ts'

const acl = di.proxy<Acl>('acl')

export default acl
