import { headers } from "next/headers"

export interface SessionState {
  currentModule: number
  currentStep: number
  completedModules: number[]
  visibleSections: string[]
  lastModified: number
  isPlaying?: boolean
  autoAdvance?: boolean
  customContent?: any
}

export interface ParticipantRecord {
  id: string
  name?: string
  lastSeen: number
  isHost?: boolean
}

export interface ScoreRecord {
  participantId: string
  participantName: string
  activity: string
  score: number
  total: number
  timestamp: number
  type: "quiz" | "atelier"
}

interface SessionRecord {
  code: string
  state: SessionState
  participants: ParticipantRecord[]
  scores: ScoreRecord[]
  createdAt: number
}

const memoryStore = new Map<string, SessionRecord>()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

const useSupabase = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)

async function supabaseFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase environment variables missing")
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...init.headers,
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=representation",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Supabase error ${response.status}: ${text}`)
  }

  return (await response.json()) as T
}

async function getClientIp() {
  try {
    const hdrs = await headers()
    return hdrs.get("x-forwarded-for")?.split(",")[0] || hdrs.get("x-real-ip") || ""
  } catch (error) {
    return ""
  }
}

export async function createSession(initialState: SessionState) {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const record: SessionRecord = {
    code,
    state: initialState,
    participants: [],
    scores: [],
    createdAt: Date.now(),
  }

  memoryStore.set(code, record)

  if (useSupabase) {
    try {
      await supabaseFetch("sessions", {
        method: "POST",
        body: JSON.stringify({
          code,
          state: record.state,
          created_at: new Date(record.createdAt).toISOString(),
          client_ip: await getClientIp(),
        }),
      })
    } catch (error) {
      console.error("Supabase createSession failed, keeping memory copy", error)
    }
  }

  return record
}

export async function upsertSessionState(code: string, state: SessionState) {
  const existing = memoryStore.get(code)
  const merged: SessionRecord = existing
    ? { ...existing, state }
    : { code, state, participants: [], scores: [], createdAt: Date.now() }

  memoryStore.set(code, merged)

  if (useSupabase) {
    try {
      await supabaseFetch("sessions", {
        method: "POST",
        body: JSON.stringify({
          code,
          state,
          created_at: new Date(merged.createdAt).toISOString(),
          updated_at: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error("Supabase upsert failed, keeping memory copy", error)
    }
  }

  return merged
}

export async function getSession(code: string) {
  const local = memoryStore.get(code)
  if (local) return local

  if (useSupabase) {
    try {
      const sessions = await supabaseFetch<SessionRecord[]>(`sessions?code=eq.${code}&limit=1`)
      const remote = sessions?.[0]
      if (remote) {
        memoryStore.set(code, remote)
        return remote
      }
    } catch (error) {
      console.error("Supabase getSession failed, falling back to memory", error)
    }
  }

  return null
}

export async function registerParticipant(
  code: string,
  participant: ParticipantRecord,
): Promise<ParticipantRecord[]> {
  const session = memoryStore.get(code) || {
    code,
    state: {
      currentModule: 0,
      currentStep: 0,
      completedModules: [],
      visibleSections: ["intro"],
      lastModified: Date.now(),
    },
    participants: [],
    scores: [],
    createdAt: Date.now(),
  }

  const others = session.participants.filter((p) => p.id !== participant.id)
  const updatedParticipants = [...others, { ...participant, lastSeen: Date.now() }]
  session.participants = updatedParticipants
  memoryStore.set(code, session)

  if (useSupabase) {
    try {
      await supabaseFetch("participants?on_conflict=code,participant_id", {
        method: "POST",
        body: JSON.stringify({
          code,
          participant_id: participant.id,
          name: participant.name?.trim() || null,
          last_seen: new Date().toISOString(),
          is_host: participant.isHost ?? false,
        }),
      })
    } catch (error) {
      console.error("Supabase registerParticipant failed, keeping memory copy", error)
    }
  }

  return updatedParticipants
}

export async function listParticipants(code: string): Promise<ParticipantRecord[]> {
  const session = await getSession(code)
  const participants = session?.participants ?? []

  if (useSupabase) {
    try {
      const remote = await supabaseFetch<ParticipantRecord[]>(
        `participants?code=eq.${code}&order=last_seen.desc&limit=100`,
      )


      if (remote?.length) {
        const normalized = remote.map((p) => ({
          id: (p as any).participant_id ?? p.id,
          name: (p as any).name ?? (p as any).participant_name ?? p.name,
          isHost: Boolean((p as any).is_host ?? p.isHost),
          lastSeen: new Date((p as any).last_seen || Date.now()).getTime(),
        }))

        memoryStore.set(code, {
          code,
          state: session?.state ?? {
            currentModule: 0,
            currentStep: 0,
            completedModules: [],
            visibleSections: ["intro"],
            lastModified: Date.now(),
          },
          participants: normalized,
          scores: session?.scores ?? [],
          createdAt: session?.createdAt ?? Date.now(),
        })

        return normalized
      }


      return remote.map((p) => ({
        id: (p as any).participant_id ?? p.id,
        name: (p as any).name ?? (p as any).participant_name ?? p.name,
        isHost: Boolean((p as any).is_host ?? p.isHost),
        lastSeen: new Date((p as any).last_seen || Date.now()).getTime(),
      }))


    } catch (error) {
      console.error("Supabase participants fallback to memory", error)
    }
  }

  return participants
}

export async function addScore(code: string, score: ScoreRecord) {
  const session = memoryStore.get(code) || {
    code,
    state: {
      currentModule: 0,
      currentStep: 0,
      completedModules: [],
      visibleSections: ["intro"],
      lastModified: Date.now(),
    },
    participants: [],
    scores: [],
    createdAt: Date.now(),
  }

  const filtered = session.scores.filter(
    (s) => !(s.participantId === score.participantId && s.activity === score.activity && s.type === score.type),
  )
  const updated = [...filtered, score]
  session.scores = updated
  memoryStore.set(code, session)

  if (useSupabase) {
    try {
      await supabaseFetch("scores", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          code,
          participant_id: score.participantId,
          participant_name: score.participantName,
          activity: score.activity,
          score: score.score,
          total: score.total,
          type: score.type,
          timestamp: new Date(score.timestamp).toISOString(),
        }),
      })
    } catch (error) {
      console.error("Supabase score insert failed, keeping memory copy", error)
    }
  }

  return updated
}

export async function listScores(code: string) {
  const session = await getSession(code)
  const scores = session?.scores ?? []

  if (useSupabase) {
    try {
      const remote = await supabaseFetch<ScoreRecord[]>(
        `scores?code=eq.${code}&order=timestamp.desc&limit=200`,
      )
      const normalized = remote.map((score) => ({
        participantId: (score as any).participant_id ?? score.participantId,
        participantName: (score as any).participant_name ?? score.participantName,
        activity: score.activity,
        score: score.score,
        total: score.total,
        type: score.type,
        timestamp: (() => {
          const raw = (score as any).timestamp ?? score.timestamp
          const parsed = typeof raw === "string" ? Date.parse(raw) : Number(raw)
          return Number.isFinite(parsed) ? parsed : Date.now()
        })(),
      }))

      memoryStore.set(code, {
        code,
        state: session?.state ?? {
          currentModule: 0,
          currentStep: 0,
          completedModules: [],
          visibleSections: ["intro"],
          lastModified: Date.now(),
        },
        participants: session?.participants ?? [],
        scores: normalized,
        createdAt: session?.createdAt ?? Date.now(),
      })

      return normalized
    } catch (error) {
      console.error("Supabase scores fallback to memory", error)
    }
  }

  return scores
}

export async function clearSupabaseData() {
  memoryStore.clear()

  if (!useSupabase) {
    return { cleared: false, reason: "Supabase non configuré" }
  }

  const headers = { Prefer: "return=minimal" }

  await Promise.all([
    supabaseFetch("scores?code=not.is.null", { method: "DELETE", headers }),
    supabaseFetch("participants?code=not.is.null", { method: "DELETE", headers }),
    supabaseFetch("sessions?code=not.is.null", { method: "DELETE", headers }),
  ])

  return { cleared: true }
}
