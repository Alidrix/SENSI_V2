import { type NextRequest, NextResponse } from "next/server"
import { writeFile, readFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export const runtime = "nodejs"

// Chemin pour stocker l'état de présentation
const STATE_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "tmp")
const STATE_FILE = path.join(STATE_DIR, "presentation-state.json")

// État par défaut
const DEFAULT_STATE = {
  currentModule: 0,
  currentStep: 0,
  completedModules: [],
  visibleSections: ["intro"],
  lastModified: Date.now(),
  isPlaying: false,
  autoAdvance: false,
  sessionId: Date.now().toString(),
}

// Fonction pour s'assurer que le dossier tmp existe
async function ensureStateDir() {
  if (!existsSync(STATE_DIR)) {
    await mkdir(STATE_DIR, { recursive: true })
  }
}

// Fonction pour lire l'état
async function readState() {
  try {
    await ensureStateDir()
    if (existsSync(STATE_FILE)) {
      const data = await readFile(STATE_FILE, "utf-8")
      return JSON.parse(data)
    }
    return DEFAULT_STATE
  } catch (error) {
    console.error("Erreur lecture état:", error)
    return DEFAULT_STATE
  }
}

// Fonction pour écrire l'état
async function writeState(state: any) {
  try {
    await ensureStateDir()
    await writeFile(STATE_FILE, JSON.stringify(state, null, 2))
    return true
  } catch (error) {
    console.error("Erreur écriture état:", error)
    return false
  }
}

// GET - Récupérer l'état actuel
export async function GET() {
  try {
    const state = await readState()
    return NextResponse.json(state)
  } catch (error) {
    console.error("Erreur GET:", error)
    return NextResponse.json(DEFAULT_STATE)
  }
}

// POST - Mettre à jour l'état (admin seulement)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { isAdmin, state: newState } = body

    if (!isAdmin) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const updatedState = {
      ...newState,
      lastModified: Date.now(),
    }

    const success = await writeState(updatedState)
    if (success) {
      return NextResponse.json(updatedState)
    } else {
      return NextResponse.json({ error: "Erreur de sauvegarde" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erreur POST:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Reset de l'état (admin seulement)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { isAdmin } = body

    if (!isAdmin) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const resetState = {
      ...DEFAULT_STATE,
      sessionId: Date.now().toString(),
      lastModified: Date.now(),
    }

    const success = await writeState(resetState)
    if (success) {
      return NextResponse.json(resetState)
    } else {
      return NextResponse.json({ error: "Erreur de reset" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erreur DELETE:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
