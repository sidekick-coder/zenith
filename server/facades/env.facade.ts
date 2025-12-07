import EnvService from '#server/services/env.service.ts'

const env = new EnvService()

env.load()

export default env
