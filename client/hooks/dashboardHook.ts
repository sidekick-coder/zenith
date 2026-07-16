import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { container, DashboardWidgetRegistry, DashboardWidgetDefinitionChart } from '@sidekick-coder/zenith-kit/client'
import { defineAsyncComponent } from 'vue'
import DashboardWidgetDefinitionText from '#client/entities/DashboardWidgetDefinitionText.ts'


export default class extends LifecycleHook {
    public async register(): Promise<void> {
        const dashboardRegistry = new DashboardWidgetRegistry()

        DashboardWidgetDefinitionChart.setRenderer(
            defineAsyncComponent(() => import('#client/components/DashboardWidgetRenderChart.vue'))
        )

        dashboardRegistry.register(
            new DashboardWidgetDefinitionText(),
            new DashboardWidgetDefinitionChart()
        )

        container.set(DashboardWidgetRegistry, dashboardRegistry)
    }
}
