import { computed, reactive, ref } from 'vue'
import { logger } from '../utils'
import Acl from '#shared/entities/acl.entity.ts'
import type Permission from '#shared/entities/permission.entity.ts'

const acl = ref<Acl>(new Acl([]))

const can: Acl['can'] = (...args) => {
    return acl.value.can(...args)
}

const cannot: Acl['cannot'] = (...args) => {
    return acl.value.cannot(...args)
}

function load(permissions: Permission[] = []) {
    acl.value = new Acl(permissions)

    logger.debug('acl load', {
        permissions: acl.value.permissions,
    })
}

export const $acl = reactive({
    permissions: computed(() => acl.value.permissions || []),
    ability: computed(() => acl.value.ability),
    can,
    cannot,
    load,
})