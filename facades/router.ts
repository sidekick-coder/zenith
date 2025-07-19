import Router from "#router/router.ts"
import di from "./di.ts"

const router = di.singleton(Router)

export default router