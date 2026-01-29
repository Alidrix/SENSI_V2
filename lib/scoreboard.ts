export type ScoreType = "quiz" | "atelier"

export interface ScoreEntry {
  participantId: string
  participantName: string
  activity: string
  score: number
  total: number
  timestamp: number
  type: ScoreType
}

const getStorageKey = (roomCode: string) => `room_${roomCode}_scores`

async function postJSON(url: string, body: any) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Request failed ${response.status}`)
  }

  return response.json()
}

async function getJSON<T>(url: string) {
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`Request failed ${response.status}`)
  }
  return (await response.json()) as T
}

export async function recordScore(roomCode: string, entry: ScoreEntry) {
  if (!roomCode) return

  try {
    await postJSON(`/api/sessions/${roomCode}/scores`, entry)
  } catch (error) {
    const existing = await getScores(roomCode)
    const filtered = existing.filter(
      (item) => !(item.participantId === entry.participantId && item.activity === entry.activity && item.type === entry.type),
    )
    const updated = [...filtered, entry]
    localStorage.setItem(getStorageKey(roomCode), JSON.stringify(updated))
  }
}

export async function getScores(roomCode: string): Promise<ScoreEntry[]> {
  if (!roomCode) return []
  try {
    const data = await getJSON<{ scores: ScoreEntry[] }>(`/api/sessions/${roomCode}/scores`)
    return data.scores
  } catch (error) {
    try {
      const raw = localStorage.getItem(getStorageKey(roomCode))
      if (!raw) return []
      return JSON.parse(raw) as ScoreEntry[]
    } catch (err) {
      console.error("Erreur de lecture du scoreboard", err)
      return []
    }
  }
}

export function clearScores(roomCode: string) {
  if (!roomCode) return
  localStorage.removeItem(getStorageKey(roomCode))
}
