import validator from '#shared/services/validator.service.ts'

export const schema = validator.create(v => v.object({ 
    'logo-type': v.union([v.literal('url'), v.literal('svg'), v.literal('file')]),
    'logo-url': v.optional(v.string()),
    'logo-svg': v.optional(v.string()),
    'logo-file-id': v.optional(v.string()),
    
    // Main theme colors
    'color-background': v.string(),
    'color-foreground': v.string(),
    'color-card': v.string(),
    'color-card-foreground': v.string(),
    'color-popover': v.string(),
    'color-popover-foreground': v.string(),
    'color-primary': v.string(),
    'color-primary-foreground': v.string(),
    'color-secondary': v.string(),
    'color-secondary-foreground': v.string(),
    'color-muted': v.string(),
    'color-muted-foreground': v.string(),
    'color-accent': v.string(),
    'color-accent-foreground': v.string(),
    'color-destructive': v.string(),
    'color-destructive-foreground': v.string(),
    'color-border': v.string(),
    'color-input': v.string(),
    'color-ring': v.string(),
    
    // Chart colors
    'color-chart-1': v.string(),
    'color-chart-2': v.string(),
    'color-chart-3': v.string(),
    'color-chart-4': v.string(),
    'color-chart-5': v.string(),
    
    // Sidebar colors
    'color-sidebar': v.string(),
    'color-sidebar-foreground': v.string(),
    'color-sidebar-primary': v.string(),
    'color-sidebar-primary-foreground': v.string(),
    'color-sidebar-accent': v.string(),
    'color-sidebar-accent-foreground': v.string(),
    'color-sidebar-border': v.string(),
    'color-sidebar-ring': v.string(),
}))

export const update = validator.create(v => v.partial(schema))