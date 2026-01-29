"use client"

import React, { useState, useEffect } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, Settings, Trophy, Target, Wifi, RotateCcw, Crown, UserRound } from "lucide-react"
import Image from "next/image"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { usePeerConnection } from "@/hooks/use-peer-connection"
import { AdminPanel } from "@/components/admin-panel"
import { UserView } from "@/components/user-view"
import { Input } from "@/components/ui/input"
import { getTrainingContent } from "@/lib/training-content"
import { clearScores } from "@/lib/scoreboard"

export default function CybersecurityTraining() {
  // Vérifier si l'utilisateur est en mode admin
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [sessionStartTime] = useState(Date.now())
  const [joinCode, setJoinCode] = useState("")
  const [participantName, setParticipantName] = useState("")
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  // État global de la présentation avec synchronisation peer-to-peer
  const {
    state: presentationState,
    updateState: setPresentationState,
    isConnected,
    connectionCount,
    roomCode,
    joinRoom,
    createRoom,
    isHost,
    participant,
  } = usePeerConnection({
    currentModule: 0,
    currentStep: 0,
    completedModules: [] as number[],
    visibleSections: ["intro"] as string[],
    lastModified: Date.now(),
    isPlaying: false,
    autoAdvance: false,
    customContent: undefined,
  })

  const trainingContent = getTrainingContent(presentationState.customContent)

  // Statistiques de session (local)
  const [sessionStats, setSessionStats] = useLocalStorage("session-stats", {
    startTime: sessionStartTime,
    participantCount: 1,
    completedModules: 0,
    totalInteractions: 0,
  })

  // Vérifier les paramètres URL pour auto-join
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const roomParam = urlParams.get("room")
    if (roomParam && !isConnected) {
      joinRoom(roomParam.toUpperCase())
    }
  }, [joinRoom, isConnected])

  // Forcer la re-render quand l'état change
  useEffect(() => {
    setLastUpdate(Date.now())
  }, [presentationState])

  // Mettre à jour les statistiques
  useEffect(() => {
    setSessionStats({
      ...sessionStats,
      completedModules: presentationState.completedModules.length,
      totalInteractions: sessionStats.totalInteractions + 1,
    })
  }, [presentationState.currentModule, presentationState.currentStep])

  // Fonction pour basculer entre mode admin et utilisateur
  const toggleAdmin = (password: string) => {
    if (password === "admin123") {
      setIsAdmin(true)
      setShowAdminLogin(false)
      // Créer automatiquement une room quand on devient admin
      if (!isConnected) {
        createRoom()
      }
    } else {
      alert("Mot de passe incorrect")
    }
  }

  // Fonction pour quitter le mode admin
  const exitAdmin = () => {
    setIsAdmin(false)
  }

  // Fonction pour reset la session
  const handleResetSession = async () => {
    if (
      confirm(
        "⚠️ ATTENTION ⚠️\n\nCette action va complètement réinitialiser la formation pour TOUS les participants.\n\nÊtes-vous sûr de vouloir continuer ?",
      )
    ) {
      const previousRoomCode = roomCode

      // Reset l'état
      setPresentationState({
        currentModule: 0,
        currentStep: 0,
        completedModules: [],
        visibleSections: ["intro"],
        lastModified: Date.now(),
        isPlaying: false,
        autoAdvance: false,
        customContent: undefined,
      })

      // Nettoyer le localStorage local
      localStorage.removeItem("session-stats")
      localStorage.removeItem("user-progress")

      // Nettoyer les données de room
      if (previousRoomCode) {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith(`room_${previousRoomCode}_`)) {
            localStorage.removeItem(key)
          }
        })
        clearScores(previousRoomCode)
      }

      await createRoom()
    }
  }

  const handleCopyRoomCode = async () => {
    if (!roomCode) return

    try {
      await navigator.clipboard.writeText(roomCode)
      setCopyMessage("Code de session copié")
      setTimeout(() => setCopyMessage(null), 2000)
    } catch (error) {
      console.error("Impossible de copier le code", error)
      setCopyMessage("Impossible de copier le code")
      setTimeout(() => setCopyMessage(null), 2000)
    }
  }

  // Si pas connecté, afficher l'interface de connexion
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header simplifié */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src="/images/logo-ccin.png"
                  alt="C'CIN - Chartres innovations numériques"
                  width={120}
                  height={60}
                  className="h-12 w-auto"
                />
                <div className="h-12 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{trainingContent.title}</h1>
                  <p className="text-sm text-gray-600">{trainingContent.subtitle}</p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={() => setShowAdminLogin(true)} title="Mode administrateur">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Contenu de connexion */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {showAdminLogin && <AdminLogin onLogin={toggleAdmin} onCancel={() => setShowAdminLogin(false)} />}

          {/* Interface de connexion simplifiée pour participants */}
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Rejoindre la formation
                </CardTitle>
                <CardDescription>Entrez le code de session fourni par votre formateur</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Votre nom et prénom"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Code de session (ex: ABC123)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1"
                  maxLength={6}
                />
              </div>
                <div className="flex gap-2">
                <Button
                  onClick={() => joinRoom(joinCode.trim(), participantName.trim())}
                  disabled={!joinCode.trim() || !participantName.trim()}
                >
                  Rejoindre
                </Button>
                </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 text-sm mb-1">💡 Instructions</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Demandez le code de session à votre formateur</li>
                  <li>• La formation se synchronisera automatiquement</li>
                  <li>• Gardez cette page ouverte pendant la formation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo C'CIN */}
              <div className="flex-shrink-0">
                <Image
                  src="/images/logo-ccin.png"
                  alt="C'CIN - Chartres innovations numériques"
                  width={120}
                  height={60}
                  className="h-12 w-auto"
                />
              </div>

              {/* Séparateur vertical */}
              <div className="h-12 w-px bg-gray-300"></div>

              {/* Titre de la formation */}
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Formation Cybersécurité</h1>
                  <p className="text-sm text-gray-600">Formation interactive - Demi-journée</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {!isHost && participant?.name && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <UserRound className="h-3 w-3" />
                  {participant.name}
                </Badge>
              )}

              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {connectionCount} participant{connectionCount > 1 ? "s" : ""}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {presentationState.completedModules.length}/6 modules
              </Badge>

              {/* Indicateur de connexion */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs"
                onClick={handleCopyRoomCode}
                title="Copier le code de session"
              >
                <Wifi className="h-3 w-3" />
                Session {roomCode}
              </Button>
              {copyMessage && <span className="text-xs text-green-600">{copyMessage}</span>}

              {/* Indicateur de rôle */}
              {isHost && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <Crown className="h-3 w-3" />
                  Formateur
                </Badge>
              )}

              {/* Bouton Reset (host seulement) */}
              {isHost && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleResetSession}
                  className="flex items-center gap-1"
                  title="Reset complet de la session"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              )}

              {/* Bouton Admin */}
              {!isAdmin && isHost && (
                <Button variant="ghost" size="icon" onClick={() => setShowAdminLogin(true)} title="Mode administrateur">
                  <Settings className="h-4 w-4" />
                </Button>
              )}

              {isAdmin && <Badge variant="destructive">Mode Admin</Badge>}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Progression</span>
              <span className="text-sm text-gray-500">{presentationState.completedModules.length}/6 modules</span>
              <span className="text-xs text-gray-400">
                (Module {presentationState.currentModule + 1}, Étape {presentationState.currentStep + 1})
              </span>
              {presentationState.isPlaying && (
                <Badge variant="default" className="text-xs animate-pulse">
                  <Target className="h-3 w-3 mr-1" />
                  Auto
                </Badge>
              )}
            </div>
            <Progress value={(presentationState.completedModules.length / 6) * 100} className="h-2" />
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAdminLogin && <AdminLogin onLogin={toggleAdmin} onCancel={() => setShowAdminLogin(false)} />}

        {isAdmin || isHost ? (
          <AdminPanel
            presentationState={presentationState}
            setPresentationState={setPresentationState}
            onExit={exitAdmin}
            isLoading={false}
            trainingContent={trainingContent}
            roomCode={roomCode}
            connectionCount={connectionCount}
          />
        ) : (
          <UserView
            presentationState={presentationState}
            lastUpdate={lastUpdate}
            setPresentationState={setPresentationState}
            trainingContent={trainingContent}
            roomCode={roomCode}
            participant={participant}
          />
        )}
      </div>

      {/* Footer avec informations de session */}
      {!isAdmin && (
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>Room: {roomCode}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-3 w-3" />
                  Connecté ({connectionCount} participants)
                </span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

// Composant de connexion admin amélioré
function AdminLogin({ onLogin, onCancel }: { onLogin: (password: string) => void; onCancel: () => void }) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simuler une vérification
    await new Promise((resolve) => setTimeout(resolve, 500))

    onLogin(password)
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Connexion Administrateur
          </CardTitle>
          <CardDescription>Entrez le mot de passe pour accéder au mode administrateur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez le mot de passe..."
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
