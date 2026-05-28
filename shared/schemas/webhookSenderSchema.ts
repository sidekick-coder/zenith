import * as v from 'valibot'

export type WebhookSender = v.InferOutput<typeof webhookSenderSchema>

export const webhookSenderSchema = v.object({
    id: v.string(),
    name: v.string(),

    trigger_events: v.array(v.string()),

    request_url: v.string(),
    request_method: v.optional(v.picklist(['GET', 'POST', 'PUT', 'DELETE'])),
    request_headers: v.optional(v.record(v.string(), v.string())),
    request_body: v.optional(v.string()),
})

export const webhookSenderCreateSchema = v.omit(webhookSenderSchema, ['id'])

export const webhookSenderUpdateSchema = v.partial(webhookSenderCreateSchema)
