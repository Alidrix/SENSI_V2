import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/server/persistence"

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => ({}))
  const { initialState } = payload

  const state =
    initialState ||
    ({
      currentModule: 0,
      currentStep: 0,
      completedModules: [],
      visibleSections: ["intro"],
      lastModified: Date.now(),
      isPlaying: false,
      autoAdvance: false,
    } as const)

  const session = await createSession(state)

  return NextResponse.json({ code: session.code, state: session.state })
}
