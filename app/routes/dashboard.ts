import { autoRoutes } from "@app/utils/autoPages";

export default autoRoutes({
    basePath: 'admin',
    imports: import.meta.glob<any>("../pages/**/*.vue"),
    filterParts: ['pages']
})
