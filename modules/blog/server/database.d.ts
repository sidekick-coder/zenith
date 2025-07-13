// Blog module database types
import type { Generated, ColumnType } from 'kysely'

export interface PostTable {
  id: Generated<number>
  title: string
  content: string
  user_id: number
  created_at: ColumnType<Date, string | undefined, never>
}

export interface CommentTable {
  id: Generated<number>
  content: string
  post_id: number
  user_id: number
  created_at: ColumnType<Date, string | undefined, never>
}

// Extend the global DatabaseTables interface
declare module '#database' {
  interface Tables {
    posts: PostTable
    comments: CommentTable
  }
}

export {}