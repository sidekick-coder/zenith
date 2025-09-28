import { computed, reactive, ref, watch } from 'vue'
import { $auth } from './useAuth'
import Acl from '#shared/entities/acl.entity.ts'

const acl = ref<Acl>(new Acl([]))

const can: Acl['can'] = (...args) => {
    return acl.value.can(...args)
}

const cannot: Acl['cannot'] = (...args) => {
    return acl.value.cannot(...args)
}

watch(() => $auth.user, (newUser) => {
    acl.value = new Acl(newUser?.permissions || [])
}, { immediate: true })


export const $acl = reactive({
    ability: computed(() => acl.value.ability),
    can,
    cannot,
})