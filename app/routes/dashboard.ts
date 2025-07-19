import { autoRoutes } from "@app/utils/autoPages";

const pages = autoRoutes({
    basePath: 'admin',
    imports: import.meta.glob<any>("../pages/**/*.vue"),
    filterParts: ['pages']
})

pages.unshift({
    path: '/',
    redirect: '/admin',
})

export default pages;
