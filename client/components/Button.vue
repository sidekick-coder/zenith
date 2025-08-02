<script lang="ts">
import { RouterLink } from 'vue-router'
import MComponent from './Component.vue'
import Icon from './Icon.vue'
import {
    Tooltip, TooltipContent, TooltipTrigger 
} from '#app/components/ui/tooltip'
import Button from '#app/components/ui/button/Button.vue'

export interface MButtonProps {
    label?: string | null;
    disabled?: boolean;
    href?: string | null;
    to?: string | null;
    tooltip?: string | null;
    tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
}
</script>
<script setup lang="ts">
const props = withDefaults(
    defineProps<MButtonProps>(),
    {
        label: null,
        disabled: false,
        href: undefined,
        to: null,
        tooltip: null,
        tooltipSide: 'top',
    }
)

const loading = defineModel<boolean>('loading', {
    type: Boolean,
    default: false,
})

const emit = defineEmits<{
    (e: 'click'): void;
}>()

function onClick() {
    if (props.href) {
        return
    }

    emit('click')
}

let is = null

if (props.href) {
    is = 'a'
}

if (props.to) {
    is = RouterLink
}
</script>

<template>
    <Tooltip v-if="tooltip">
        <TooltipTrigger>
            <MComponent
                :is="is"
                :href
                :to
            >
                <Button
                    v-bind="$attrs"
                    :loading="loading"
                    :disabled="disabled || loading"
                    class="cursor-pointer"
                    @click="onClick"
                >
                    <Icon
                        v-if="loading"
                        name="Loader2"
                        class="animate-spin"
                    />

                    <span
                        v-else-if="label"
                        class="text-sm"
                    >
                        {{ label }}
                    </span>

                    <slot v-else />
                </Button>
            </MComponent>
        </TooltipTrigger>
        <TooltipContent :side="tooltipSide">
            {{ tooltip }}
        </TooltipContent>
    </Tooltip>
    <MComponent
        :is
        v-else
        :href
        :to
    >
        <Button
            v-bind="$attrs"
            :loading="loading"
            :disabled="disabled || loading"
            class="cursor-pointer"
            @click="onClick"
        >
            <Icon
                v-if="loading"
                name="Loader2"
                class="animate-spin"
            />

            <span
                v-else-if="label"
                class="text-sm"
            >
                {{ label }}
            </span>

            <slot v-else />
        </Button>
    </MComponent>
</template>
