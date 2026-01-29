"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface PresentationState {
  currentModule: number
  currentStep: number
  completedModules: number[]
  visibleSections: string[]
  lastModified: number
  isPlaying?: boolean
  autoAdvance?: boolean
  sessionId?: string
}

export function useSharedPresentationState(initialState: PresentationState, isAdmin = false) {
  const [state, setState] = useState<PresentationState>(initialState)
  const [isOnline, setIsOnline] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState(Date.now())
  const [isLoading, setIsLoading] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isUpdatingRef = useRef(false)
  const lastKnownModified = useRef(0)

  // Fonction pour récupérer l'état depuis le serveur
  const fetchState = useCallback(async () => {
    if (isUpdatingRef.current) return

    try {
      const response = await fetch("/api/presentation-state", {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const serverState = await response.json()

        // Ne mettre à jour que si l'état du serveur est plus récent
        if (serverState.lastModified > lastKnownModified.current) {
          setState(serverState)
          lastKnownModified.current = serverState.lastModified
          setLastSyncTime(Date.now())
        }

        setIsOnline(true)
      } else {
        console.error("Erreur de récupération:", response.status)
        setIsOnline(false)
      }
    } catch (error) {
      console.error("Erreur de synchronisation:", error)
      setIsOnline(false)
    }
  }, [])

  // Fonction pour envoyer l'état au serveur (admin seulement)
  const updateState = useCallback(
    async (newState: PresentationState) => {
      if (!isAdmin) {
        console.warn("Tentative de mise à jour sans droits admin")
        return
      }

      isUpdatingRef.current = true
      setIsLoading(true)

      try {
        const response = await fetch("/api/presentation-state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isAdmin: true,
            state: newState,
          }),
        })

        if (response.ok) {
          const updatedState = await response.json()
          setState(updatedState)
          lastKnownModified.current = updatedState.lastModified
          setLastSyncTime(Date.now())
          setIsOnline(true)
        } else {
          console.error("Erreur de mise à jour:", response.status)
          setIsOnline(false)
          // En cas d'erreur, garder l'état local
          setState(newState)
        }
      } catch (error) {
        console.error("Erreur de mise à jour:", error)
        setIsOnline(false)
        // En cas d'erreur, garder l'état local
        setState(newState)
      } finally {
        isUpdatingRef.current = false
        setIsLoading(false)
      }
    },
    [isAdmin],
  )

  // Fonction pour reset l'état (admin seulement)
  const resetState = useCallback(async () => {
    if (!isAdmin) {
      console.warn("Tentative de reset sans droits admin")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/presentation-state", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAdmin: true,
        }),
      })

      if (response.ok) {
        const resetState = await response.json()
        setState(resetState)
        lastKnownModified.current = resetState.lastModified
        setLastSyncTime(Date.now())
        setIsOnline(true)
      } else {
        console.error("Erreur de reset:", response.status)
        setIsOnline(false)
      }
    } catch (error) {
      console.error("Erreur de reset:", error)
      setIsOnline(false)
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // Démarrer le polling pour la synchronisation
  useEffect(() => {
    // Récupérer l'état initial
    fetchState()

    // Configurer le polling
    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      pollingIntervalRef.current = setInterval(fetchState, 1500) // Toutes les 1.5 secondes
    }

    startPolling()

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [fetchState])

  // Gérer la visibilité de la page pour optimiser le polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Arrêter le polling quand la page n'est pas visible
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
      } else {
        // Reprendre le polling et synchroniser immédiatement
        fetchState()
        pollingIntervalRef.current = setInterval(fetchState, 1500)
      }
    }

    const handleFocus = () => {
      // Synchroniser immédiatement quand la fenêtre reprend le focus
      fetchState()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [fetchState])

  // Nettoyer l'intervalle au démontage
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  return {
    state,
    updateState,
    resetState,
    isOnline,
    lastSyncTime,
    isLoading,
  }
}
