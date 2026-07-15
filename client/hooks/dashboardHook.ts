import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import DashboardWidgetDefinitionChart from '#client/entities/DashboardWidgetDefinitionChart.ts'
import DashboardWidgetDefinitionText from '#client/entities/DashboardWidgetDefinitionText.ts'
import dashboardRegistry from '#client/facades/dashboardRegistry.ts'


export default class extends LifecycleHook {
    public async register(): Promise<void> {
        dashboardRegistry.register(
            new DashboardWidgetDefinitionChart(),
            new DashboardWidgetDefinitionText(),
        )
    }
}
