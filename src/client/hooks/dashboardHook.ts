import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { container, DashboardWidgetRegistry, WidgetTextDefinition, WidgetChartDefinition } from '@sidekick-coder/zenith-kit/client'
import { defineAsyncComponent } from 'vue'


export default class extends LifecycleHook {
    public async register(): Promise<void> {
        const dashboardRegistry = new DashboardWidgetRegistry()

        WidgetChartDefinition.setRenderer(
            defineAsyncComponent(() => import('#client/components/DashboardWidgetRenderChart.vue'))
        )

        dashboardRegistry.register(
            new WidgetChartDefinition(),
            new WidgetTextDefinition()
        )

        container.set(DashboardWidgetRegistry, dashboardRegistry)
    }
}
