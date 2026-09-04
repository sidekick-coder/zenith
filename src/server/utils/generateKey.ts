import { randomBytes } from 'node:crypto'

export function generateKey(size: number): string {
  const bits = (size + 1) * 6
  
  const buffer = randomBytes(Math.ceil(bits / 8))

  return Buffer.from(buffer)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/\=/g, '')
        .slice(0, size)
}