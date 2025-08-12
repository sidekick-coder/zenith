<script setup lang="ts">
import { ref, watch } from 'vue'
import DialogFooter from './ui/dialog/DialogFooter.vue'
import DialogDescription from './ui/dialog/DialogDescription.vue'
import Button from '#client/components/ui/button/Button.vue'
import Dialog from '#client/components/ui/dialog/Dialog.vue'
import DialogContent from '#client/components/ui/dialog/DialogContent.vue'
import DialogHeader from '#client/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '#client/components/ui/dialog/DialogTitle.vue'
import DialogTrigger from '#client/components/ui/dialog/DialogTrigger.vue'
import DriveExplorer from '#client/components/DriveExplorer.vue'
import DriveEntry from '#shared/entities/driveEntry.entity.ts'
import { $t } from '#shared/lang.ts'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    driveId: {
        type: String,
        default: null
    },
    initialPath: {
        type: String,
        default: '/'
    },
    multiple: {
        type: Boolean,
        default: false
    },
    onlyDirectories: {
        type: Boolean,
        default: false
    }
})



const open = ref(false)
const path = ref('/')
const explorerRef = ref<InstanceType<typeof DriveExplorer>>()
const items = ref([])
const selected = ref({})

const model = defineModel({
    type: Array as () => DriveEntry[],
    default: () => [],
})


function onSelectEntry() {
    const selectedItems = [] as any[]

    Object.keys(selected.value).forEach(index => {
        selectedItems.push(items.value[Number(index)])
    })

    model.value = selectedItems
    open.value = false
}

function onCancel() {
    open.value = false
}

watch(open, (value) => {
    if (value) {
        path.value = props.initialPath
    }
})

</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button 
                v-bind="$attrs"
                :disabled="!!driveId"
            >
                {{ $t('Browse') }}
            </Button>
        </DialogTrigger>
        
        <DialogContent class="max-w-5xl max-h-[80vh]">
            <DialogHeader>
                <DialogTitle>{{ $t('Select Entry') }}</DialogTitle>
                <DialogDescription>{{ $t('Please select an entry') }}</DialogDescription>
            </DialogHeader>
            
            <div class="flex-1 overflow-hidden">
                <DriveExplorer
                    v-if="driveId"
                    ref="explorerRef"
                    v-model:path="path"
                    v-model:selected="selected"
                    v-model:items="items"
                    :selection="multiple ? 'multiple' : 'single'"
                    :drive-id="driveId"
                    class="h-[60vh] overflow-y-auto"
                />
            </div>

            <DialogFooter>
                <div class="flex gap-2">
                    <Button 
                        variant="outline" 
                        @click="onCancel"
                    >
                        {{ $t('Cancel') }}
                    </Button>
                                
                    <Button @click="onSelectEntry">
                        {{ $t('Select') }}
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
