import { defineAsyncComponent } from 'vue'
import DashboardWidgetDefinition from './DashboardWidgetDefinition'
import { defineFormFields } from '#client/components/FormAutoFieldList.vue'

export default class DashboardWidgetDefinitionUnknown extends DashboardWidgetDefinition {
    constructor() {
        super()
        this.id = 'text'
        this.name = 'Text'
        this.description = $t('Add a text widget to your dashboard.')

    }

    public component() {
        return defineAsyncComponent(() => import('#client/components/DashboardWidgetRenderText.vue'))
    }

    public actions() {
        const fields = defineFormFields({
            text: {
                component: 'textarea',
                label: $t('Text'),
                placeholder: $t('Enter your text here...'),
            },
            size: {
                component: 'text-field',
                type: 'number',
                label: $t('Size'),
            },
            color: {
                component: 'color-picker',
                label: $t('Color'),
            }
        })

        return [
            {
                props: { fields },
                component: defineAsyncComponent(() => import('#client/components/DashboardWidgetActionSetting.vue')),
            }
        ]
    }
}
