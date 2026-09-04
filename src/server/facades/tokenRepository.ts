import { TokenRepository } from '@sidekick-coder/zenith-kit/server'
import db from '#server/facades/db.facade.ts'

const tokenRepository = new TokenRepository(db as any)

export default tokenRepository

