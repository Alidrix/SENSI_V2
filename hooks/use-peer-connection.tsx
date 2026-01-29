"use client"

import { useState, useEffect, useCallback } from "react"

interface ParticipantInfo {
  id: string
  name?: string
}

interface PresentationState {
  currentModule: number
  currentStep: number
  completedModules: number[]
  visibleSections: string[]
  lastModified: number
  isPlaying?: boolean
  autoAdvance?: boolean
  sessionId?: string
  customContent?: any
}

interface PeerConnectionHook {
  state: PresentationState
  updateState: (newState: PresentationState) => void
  isConnected: boolean
  connectionCount: number
  roomCode: string
  joinRoom: (code: string, participantName?: string) => void
  createRoom: () => void
  isHost: boolean
  participant?: ParticipantInfo
}

// Configuration STUN pour WebRTC (serveurs publics gratuits)
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
]

export function usePeerConnection(initialState: PresentationState): PeerConnectionHook {
  const serverSyncFlag = process.env.NEXT_PUBLIC_SERVER_SYNC
  const [state, setState] = useState<PresentationState>(initialState)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionCount, setConnectionCount] = useState(0)
  const [roomCode, setRoomCode] = useState("")
  const [isHost, setIsHost] = useState(false)
  const [participant, setParticipant] = useState<ParticipantInfo | undefined>(undefined)
  const [useServerSync, setUseServerSync] = useState(serverSyncFlag !== "false")

  // Générer un code de room aléatoire
  const fallbackGenerateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase()

  // Créer une room (mode admin/host)
  const createRoom = useCallback(async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initialState }),
      })

      if (!response.ok) throw new Error("API session indisponible")
      const data = await response.json()
      const code = data.code
      setUseServerSync(true)
      setRoomCode(code)
      setIsHost(true)
      setIsConnected(true)
      setState(initialState)
      setParticipant({ id: "HOST", name: "Formateur" })
      localStorage.setItem(
        `room_${code}_host`,
        JSON.stringify({
          type: "host",
          timestamp: Date.now(),
          state: initialState,
        }),
      )
      await fetch(`/api/sessions/${code}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "HOST", name: "Formateur", isHost: true }),
      })
      console.log("Room créée:", code)
    } catch (error) {
      const code = fallbackGenerateRoomCode()
      setUseServerSync(false)
      setRoomCode(code)
      setIsHost(true)
      setIsConnected(true)
      setParticipant({ id: "HOST", name: "Formateur" })

      localStorage.setItem(
        `room_${code}_host`,
        JSON.stringify({
          type: "host",
          timestamp: Date.now(),
          state: initialState,
        }),
      )
      console.warn("Room locale créée (fallback)", error)
    }
  }, [initialState])

  // Rejoindre une room (mode participant)
  const joinRoom = useCallback(
    async (code: string, participantName?: string) => {
      setRoomCode(code)
      setIsHost(false)

      const participantId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      const participantInfo: ParticipantInfo = { id: participantId, name: participantName }
      try {
        const response = await fetch(`/api/sessions/${code}`)
        if (!response.ok) throw new Error("Session introuvable côté serveur")
        const session = await response.json()
        setUseServerSync(true)
        setState(session.state)
        setIsConnected(true)
        setParticipant(participantInfo)
        await fetch(`/api/sessions/${code}/participants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: participantId, name: participantName, isHost: false }),
        })
        console.log("Rejoint la room (API):", code)
      } catch (error) {
        console.error("Erreur API, bascule locale", error)
        setUseServerSync(false)
        try {
          const hostData = localStorage.getItem(`room_${code}_host`)
          if (!hostData) {
            throw new Error("Room non trouvée")
          }

          const hostInfo = JSON.parse(hostData)
          setState(hostInfo.state)
          setIsConnected(true)
          setParticipant(participantInfo)
          localStorage.setItem(
            `room_${code}_participant_${participantId}`,
            JSON.stringify({
              type: "participant",
              id: participantId,
              name: participantName,
              timestamp: Date.now(),
              lastSeen: Date.now(),
            }),
          )

          const heartbeatInterval = setInterval(() => {
            const currentData = localStorage.getItem(`room_${code}_participant_${participantId}`)
            if (currentData) {
              const data = JSON.parse(currentData)
              localStorage.setItem(
                `room_${code}_participant_${participantId}`,
                JSON.stringify({
                  ...data,
                  lastSeen: Date.now(),
                }),
              )
            }
          }, 5000)

          window.addEventListener("beforeunload", () => {
            localStorage.removeItem(`room_${code}_participant_${participantId}`)
            clearInterval(heartbeatInterval)
          })

          console.log("Rejoint la room (local):", code)
        } catch (joinError) {
          console.error("Erreur lors de la connexion:", joinError)
          alert("Impossible de rejoindre la room. Vérifiez le code.")
        }
      }
    },
    [setRoomCode, setIsHost, setUseServerSync, setState, setIsConnected, setParticipant],
  )

  // Mettre à jour l'état (seulement pour l'host)
  const updateState = useCallback(
    (newState: PresentationState) => {
      const updatedState = {
        ...newState,
        lastModified: Date.now(),
      }

      setState(updatedState)

      if (!roomCode) return

      if (!isHost) {
        console.warn("Seul l'host peut synchroniser l'état — mise à jour locale uniquement")
        return
      }

      if (useServerSync) {
        fetch(`/api/sessions/${roomCode}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: updatedState }),
        }).catch((error) => console.error("Sync serveur échouée", error))
      }

      localStorage.setItem(
        `room_${roomCode}_host`,
        JSON.stringify({
          type: "host",
          timestamp: Date.now(),
          state: updatedState,
        }),
      )
    },
    [isHost, roomCode, useServerSync],
  )

  // Polling pour synchroniser l'état (pour les participants)
  useEffect(() => {
    if (!roomCode || isHost) return

    const pollInterval = setInterval(() => {
      if (useServerSync) {
        fetch(`/api/sessions/${roomCode}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.state && data.state.lastModified > state.lastModified) {
              setState(data.state)
            }
          })
          .catch((error) => console.error("Sync serveur impossible", error))
      } else {
        try {
          const hostData = localStorage.getItem(`room_${roomCode}_host`)
          if (hostData) {
            const hostInfo = JSON.parse(hostData)
            if (hostInfo.state.lastModified > state.lastModified) {
              setState(hostInfo.state)
            }
          }
        } catch (error) {
          console.error("Erreur de synchronisation:", error)
        }
      }
    }, 1000) // Polling toutes les secondes

    return () => clearInterval(pollInterval)
  }, [roomCode, isHost, state.lastModified, useServerSync])

  // Compter les participants connectés (amélioration)
  useEffect(() => {
    if (!roomCode) return

    const countInterval = setInterval(() => {
      if (useServerSync) {
        fetch(`/api/sessions/${roomCode}/participants`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            const fetchedCount = data?.participants?.length || 0
            const fallbackCount = participant ? 1 : 0
            setConnectionCount(Math.max(fetchedCount, fallbackCount))
          })
          .catch(() => setConnectionCount(participant ? 1 : 0))
        return
      }

      const keys = Object.keys(localStorage)
      const now = Date.now()
      let activeParticipants = 0

      keys.forEach((key) => {
        if (key.startsWith(`room_${roomCode}_participant_`)) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "{}")
            // Considérer comme actif si vu dans les 30 dernières secondes
            if (data.lastSeen && now - data.lastSeen < 30000) {
              activeParticipants++
            } else {
              // Supprimer les participants inactifs
              localStorage.removeItem(key)
            }
          } catch (error) {
            localStorage.removeItem(key)
          }
        }
      })

      setConnectionCount(activeParticipants)
    }, 3000) // Vérifier toutes les 3 secondes

    return () => clearInterval(countInterval)
  }, [roomCode, useServerSync])

  // Nettoyer les données expirées
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      const keys = Object.keys(localStorage)

      keys.forEach((key) => {
        if (key.startsWith("room_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "{}")
            // Supprimer les données de plus de 1 heure
            if (now - data.timestamp > 3600000) {
              localStorage.removeItem(key)
            }
          } catch (error) {
            localStorage.removeItem(key)
          }
        }
      })
    }, 60000) // Nettoyage toutes les minutes

    return () => clearInterval(cleanupInterval)
  }, [])

  return {
    state,
    updateState,
    isConnected,
    connectionCount,
    roomCode,
    joinRoom,
    createRoom,
    isHost,
    participant,
  }
}
