import validator from "#shared/services/validator.service.ts";

export const number = () => validator.create(v => v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(Number),
    v.integer(),
))

export const mysql = validator.create(v => v.object({
    host: v.string(),
    port: number(),
    database: v.string(),
    user: v.string(),
    password: v.string(),
}))

export const postgresql = validator.create(v => v.object({
    host: v.string(),
    port: number(),
    database: v.string(),
    user: v.string(),
    password: v.string(),
}))

export const sqlite = validator.create(v => v.object({
    database: v.string(),
}))