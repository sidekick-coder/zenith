<script setup lang="ts">
import Icon from '#client/components/Icon.vue'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '#client/components/ui/breadcrumb'

const props = withDefaults(defineProps<{
    path: string
    separator?: string
    showRoot?: boolean
    rootLabel?: string
    rootIcon?: string
}>(), {
    separator: '/',
    showRoot: true,
    rootLabel: 'Root',
    rootIcon: 'folder'
})

const emit = defineEmits<{
    clickPath: [path: string]
}>()

function getBreadcrumbs(): string[] {
    if (!props.path) return []
    return props.path.split(props.separator).filter(part => part.length > 0)
}

function navigateToBreadcrumb(index: number) {
    const breadcrumbs = getBreadcrumbs()
    const newPath = breadcrumbs.slice(0, index + 1).join(props.separator)
    emit('clickPath', newPath)
}

function navigateToRoot() {
    emit('clickPath', '')
}
</script>

<template>
    <Breadcrumb class="p-4">
        <BreadcrumbList>
            <BreadcrumbItem v-if="showRoot">
                <BreadcrumbLink
                    as="button"
                    class="flex items-center gap-x-2"
                    @click="navigateToRoot"
                >
                    <Icon
                        v-if="rootIcon"
                        :name="rootIcon"
                        class="size-4 mr-1"
                    />
                    <div>{{ rootLabel }}</div>
                </BreadcrumbLink>
            </BreadcrumbItem>
                
            <template
                v-for="(part, index) in getBreadcrumbs()"
                :key="index"
            >
                <BreadcrumbSeparator v-if="showRoot || index > 0" />
                <BreadcrumbItem>
                    <BreadcrumbLink
                        v-if="index < getBreadcrumbs().length - 1"
                        as="button"
                        @click="navigateToBreadcrumb(index)"
                    >
                        {{ part }}
                    </BreadcrumbLink>
                    <BreadcrumbPage v-else>
                        {{ part }}
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </template>
        </BreadcrumbList>
    </Breadcrumb>
</template>
