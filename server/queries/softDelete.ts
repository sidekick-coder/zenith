type WhereCapable<QB> = {
  where: (...args: any[]) => QB
}

export function whereNotDeleted<QB extends WhereCapable<QB>>(qb: QB): QB {
    return qb.where('deleted_at', 'is', null)
}