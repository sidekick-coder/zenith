import validator from "#shared/services/validator.service.ts";

export const mysql = validator.create(v => v.object({
    host: v.string(),
    port: v.number(),
    database: v.string(),
    user: v.string(),
    password: v.string(),
}))

export const postgresql = validator.create(v => v.object({
    host: v.string(),
    port: v.number(),
    database: v.string(),
    user: v.string(),
    password: v.string(),
}))

export const sqlite = validator.create(v => v.object({
    database: v.string(),
}))