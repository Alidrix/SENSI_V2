import { NextRequest, NextResponse } from "next/server"
import { listParticipants, registerParticipant } from "@/lib/server/persistence"

export async function GET(_: NextRequest, { params }: { params: { code: string } }) {
  const participants = await listParticipants(params.code.toUpperCase())
  return NextResponse.json({ participants })
}

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const payload = await req.json().catch(() => ({}))
  const participants = await registerParticipant(params.code.toUpperCase(), {
    id: payload.id,
    name: payload.name,
    isHost: payload.isHost,
    lastSeen: Date.now(),
  })
  return NextResponse.json({ participants })
}
