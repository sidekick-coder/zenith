import type User from '#server/entities/user.entity.ts'

export interface Events {
  'user:before-create': { user: User }
  'user:after-create': { user: User }
  'user:before-update': { user: User }
  'user:after-update': { user: User }
  'user:before-delete': { user: User }
  'user:after-delete': { user: User }
  // [key: string]: any
}

export {}