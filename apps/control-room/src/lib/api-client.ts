/**
 * SYNTHIA™ API Client
 * Single source for all backend calls.
 * Frontend never calls /api/* routes directly.
 * Emerald Tablets™ compliant — no barrel exports.
 * Bead: ZTE-ONESHOT-001
 */

const SYNTHIA_API =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SYNTHIA_API_URL)
    ? process.env.NEXT_PUBLIC_SYNTHIA_API_URL
    : 'http://31.220.58.212:4000'

type TRPCInput<T> = { json: T }
type TRPCOutput<T> = { result: { data: { json: T } } }

async function trpcQuery<T>(path: string): Promise<T> {
  const res = await fetch(`${SYNTHIA_API}/trpc/${path}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`[api-client] ${path} failed: ${res.status}`)
  const data = await res.json() as TRPCOutput<T>
  return data.result.data.json
}

async function trpcMutate<I, O>(path: string, input: I): Promise<O> {
  const body: TRPCInput<I> = { json: input }
  const res = await fetch(`${SYNTHIA_API}/trpc/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`[api-client] ${path} failed: ${res.status}`)
  const data = await res.json() as TRPCOutput<O>
  return data.result.data.json
}

export type SphereMessage = { role: string; content: string }

export type SphereChatInput = {
  sphereId: string
  message: string
  history: SphereMessage[]
}

export type SphereChatOutput = {
  sphereId: string
  sphereName: string
  locale: string
  color: string
  response: string
  timestamp: string
}

export type CouncilInput = {
  message: string
  history: SphereMessage[]
  sphereIds: string[]
}

export type CouncilOutput = {
  responses: SphereChatOutput[]
  timestamp: string
}

export type HeraldDispatchInput = {
  intent: string
  agent_id: string
  execute?: boolean
  session_id?: string
}

export type HeraldDispatchOutput = {
  route: {
    tool_id: string
    tool_name: string
    default_sphere: string
    confidence: number
    routing_method: string
  }
  intent: string
  agent_id: string
  timestamp: string
}

export type VoiceSynthInput = {
  text: string
  voiceId?: string
  language?: string
}

export type VoiceSynthOutput = {
  id: string
  text: string
  voiceId: string
  audioUrl: string | null
  duration: number
  timestamp: string
}

export type PaymentTier = {
  id: string
  name: string
  priceMXN: number
  creem_id: string | undefined
}

export type CheckoutOutput = {
  checkoutUrl: string | null
}

export const synthiaApi = {
  health: () =>
    fetch(`${SYNTHIA_API}/health`).then(r => r.json() as Promise<{ status: string }>),

  spheres: {
    list: () => trpcQuery<{ id: string; name: string; role: string; locale: string; color: string }[]>('spheres.list'),
    chat: (input: SphereChatInput) =>
      trpcMutate<SphereChatInput, SphereChatOutput>('spheres.chat', input),
    council: (input: CouncilInput) =>
      trpcMutate<CouncilInput, CouncilOutput>('spheres.council', input),
  },

  herald: {
    tools: () => trpcQuery<{ id: string; name: string; description: string; keywords: string[]; defaultSphere: string }[]>('herald.tools'),
    dispatch: (input: HeraldDispatchInput) =>
      trpcMutate<HeraldDispatchInput, HeraldDispatchOutput>('herald.dispatch', input),
  },

  voice: {
    synthesize: (input: VoiceSynthInput) =>
      trpcMutate<VoiceSynthInput, VoiceSynthOutput>('voice.synthesize', input),
    health: () => trpcQuery<{ status: string; providers: Record<string, string> }>('voice.health'),
  },

  payments: {
    tiers: () => trpcQuery<PaymentTier[]>('payments.tiers'),
    createCheckout: (input: { tierId: 'starter' | 'pro' | 'elite' }) =>
      trpcMutate<{ tierId: 'starter' | 'pro' | 'elite' }, CheckoutOutput>('payments.createCheckout', input),
  },
}
