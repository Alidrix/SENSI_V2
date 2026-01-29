import { NextRequest, NextResponse } from "next/server"
import { addScore, listScores } from "@/lib/server/persistence"

export async function GET(_: NextRequest, { params }: { params: { code: string } }) {
  const scores = await listScores(params.code.toUpperCase())
  return NextResponse.json({ scores })
}

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const payload = await req.json().catch(() => ({}))
  const scores = await addScore(params.code.toUpperCase(), payload)
  return NextResponse.json({ scores })
}
