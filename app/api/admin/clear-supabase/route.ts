import { NextResponse } from "next/server"
import { clearSupabaseData } from "@/lib/server/persistence"

export async function POST() {
  try {
    const result = await clearSupabaseData()
    if (!result.cleared) {
      return NextResponse.json({ error: result.reason ?? "Supabase disabled" }, { status: 400 })
    }

    return NextResponse.json({ status: "cleared" })
  } catch (error) {
    console.error("Clear Supabase failed", error)
    return NextResponse.json({ error: "Failed to clear Supabase" }, { status: 500 })
  }
}
