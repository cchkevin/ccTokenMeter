import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Limit, Snap, Usage } from '../types'

const snap = atom(
  { plugin: 'token-meter', key: 'snap' } as const,
  { model: '', lastModel: '', last: null, limits: [], at: 0 } as Snap,
)

const LABELS: Record<string, string> = { five_hour: '5h', seven_day: 'Week' }

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(2)}M`
    : n >= 1000
      ? `${(n / 1000).toFixed(1)}k`
      : String(n)

const pretty = (id: string) => {
  const m = /^claude-([a-z]+)-(\d+)(?:-(\d{1,2}))?(?:-\d{8})?$/.exec(id)

  return m
    ? `${m[1]![0]!.toUpperCase()}${m[1]!.slice(1)} ${m[2]}${m[3] ? `.${m[3]}` : ''}`
    : id
}

const left = (l: Limit) => `${l.left.toFixed(0)}%`

// Re-reads the model and rate limits and redraws the status line.
const refresh = async ($: EngineInterface, patch: Partial<Snap> = {}) => {
  const model = await $.session.model()
  const { rateLimits } = await $.session.usage()
  const limits: Limit[] = rateLimits
    .filter(r => r.kind in LABELS)
    .map(r => ({
      label: LABELS[r.kind]!,
      left: Math.max(0, 100 - r.percentUsed),
      resetsAt: r.resetsAt,
    }))
  const at = await $.clock.now()

  const next = await update($, snap, s => ({ ...s, ...patch, model, limits, at }))
  const s = next ?? (await read($, snap))

  const parts = [pretty(model), ...s.limits.map(l => `${l.label} ${left(l)}`)]
  if (s.last) {
    parts.push(`last ${fmt(s.last.input + s.last.cacheRead + s.last.cacheWrite)}/${fmt(s.last.output)}`)
  }
  $.ui.status(parts.join(' · '))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await refresh($)

    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    const r = yield* next(e)

    if (r.usage) {
      const u = r.usage
      await refresh($, {
        lastModel: u.model,
        last: {
          input: u.input_tokens,
          output: u.output_tokens,
          cacheRead: u.cache_read_input_tokens,
          cacheWrite: u.cache_creation_input_tokens,
        },
      })
    }

    return r
  })

  on('turn.complete', async ($, e, next) => {
    await refresh($)

    return next(e)
  })

}
