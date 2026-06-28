import DashboardWidgetDefinition from './DashboardWidgetDefinition'
import DashboardWidgetChart from '#client/components/DashboardWidgetChart.vue'

export default class DashboardWidgetDefinitionChart extends DashboardWidgetDefinition {
    constructor() {
        super()
        this.component = DashboardWidgetChart
        this.name = 'Chart'
        this.id = 'chart'
    }
}
