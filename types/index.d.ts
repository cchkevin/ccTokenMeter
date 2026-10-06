export type Usage = {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

export type Limit = { label: string; left: number; resetsAt?: string }

export type Snap = {
  model: string
  lastModel: string
  last: Usage | null
  limits: Limit[]
  at: number
}

declare module 'claude-code' {
  interface PluginState {
    'token-meter': { snap: Snap }
  }
}
