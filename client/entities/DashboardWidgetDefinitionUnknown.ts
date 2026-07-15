import DashboardWidgetDefinition from './DashboardWidgetDefinition'
import DashboardWidgetUnknown from '#client/components/DashboardWidgetUnknown.vue'

export default class DashboardWidgetDefinitionUnknown extends DashboardWidgetDefinition {
    constructor() {
        super()
        this.id = 'unknown'
        this.name = 'Unknown'
        this.component = () => DashboardWidgetUnknown
    }
}
