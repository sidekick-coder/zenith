import FetchService from '#client/services/fetch.service.ts'
import di from '#client/utils/di.ts'

const $fetch = di.proxy<FetchService>(FetchService)

export default $fetch
