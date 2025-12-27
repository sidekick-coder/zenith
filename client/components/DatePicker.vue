<script lang="ts" setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { createCalendar, toCalendarDate,fromDate,  toCalendar, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import Icon from './Icon.vue'
import { Calendar } from '#client/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '#client/components/ui/popover'
import { Button } from '#client/components/ui/button'
import { cn } from '#client/lib/utils'

const props = defineProps({
    placeholder: {
        type: String,
        default: undefined
    },
    disabled: {
        type: Boolean,
        default: undefined
    },
    class: {
        type: String,
        default: undefined
    }
})

const model = defineModel<any>({
    type: [Date, String],
    default: null
})

const open = ref(false)

const displayValue = computed(() => {
    if (!model.value) {
        return props.placeholder || $t('Select date')
    }
    
    return format(model.value, 'yyyy-MM-dd')
})

function handleSelect(value: DateValue | undefined) {
    if (!value) {
        model.value = null
        open.value = false
        return
    }

    const date = new Date(value.year, value.month - 1, value.day)
    
    model.value = date

    open.value = false
}

const calendarValue = computed({
    get() {
        if (!model.value) {
            return undefined
        }

        const date = new Date(model.value)

        return fromDate(date, getLocalTimeZone())
    },
    set(value: DateValue | undefined) {
        if (!value) {
            model.value = null
            open.value = false
            return
        }
    
        const date = new Date(value.year, value.month - 1, value.day)
    
        model.value = date

        open.value = false
    }
})
</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <Button
                variant="outline"
                :class="cn(
                    'w-full justify-start text-left font-normal',
                    !model && 'text-muted-foreground',
                    props.class
                )"
                :disabled="disabled"
            >
                <Icon
                    name="calendar"
                    class="mr-2 h-4 w-4"
                />
                {{ displayValue }}
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
            <Calendar v-model="calendarValue" />
        </PopoverContent>
    </Popover>
</template>
