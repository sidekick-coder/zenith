// Blog module database types
import type { Generated } from 'kysely'

export interface ProductsTable {
  id: Generated<number>
  name: string
  description: string
  price: number
}

// Extend the global DatabaseTables interface
declare module '#database' {
  interface Tables {
    products: ProductsTable
  }
}

export {}