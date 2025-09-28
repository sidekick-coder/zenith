import { reactive, ref } from 'vue'
import { $fetch } from '#client/utils/index.ts'
import User from '#shared/entities/user.entity.ts'
import Acl from '#shared/entities/acl.entity.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

const user = ref<User>()
const acl = ref<Acl>(new Acl([]))

interface LoadOptions {
    user?: User
}

function load(options: LoadOptions) {
    user.value = options.user ? User.from(options.user) : undefined

    acl.value = new Acl(user.value?.permissions || [])
}

interface LogoutOptions {
    redirect?: string
}

async function logout(options?: LogoutOptions) {
    const [error] = await tryCatch(() =>  $fetch('/auth/logout', { method: 'POST', }))

    if (error) {
        return
    }

    window.location.href = options?.redirect || '/'
}

export const $auth = reactive({
    user,
    acl,
    logout,
    load
})