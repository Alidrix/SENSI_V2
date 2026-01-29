import { NextRequest, NextResponse } from "next/server"
import { getSession, upsertSessionState } from "@/lib/server/persistence"

export async function GET(_: NextRequest, { params }: { params: { code: string } }) {
  const session = await getSession(params.code.toUpperCase())
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }
  return NextResponse.json(session)
}

export async function PUT(req: NextRequest, { params }: { params: { code: string } }) {
  const payload = await req.json().catch(() => ({}))
  const session = await upsertSessionState(params.code.toUpperCase(), payload.state)
  return NextResponse.json(session)
}
