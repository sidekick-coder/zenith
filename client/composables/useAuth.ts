import { reactive, ref } from 'vue'
import { $fetch } from '#client/utils/index.ts'
import User from '#shared/entities/user.entity.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

const user = ref<User>()

interface LoadOptions {
    user?: User
}

function load(options: LoadOptions) {
    user.value = options.user ? User.from(options.user) : undefined
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
    logout,
    load
})