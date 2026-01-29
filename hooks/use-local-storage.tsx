"use client"

import { useState, useEffect, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // État pour stocker notre valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      // Récupérer depuis localStorage par clé
      const item = window.localStorage.getItem(key)
      // Analyser le JSON stocké ou retourner initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  // Fonction pour mettre à jour la valeur
  const setValue = useCallback(
    (value: T) => {
      try {
        // Permettre à la valeur d'être une fonction pour avoir la même API que useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        // Sauvegarder l'état
        setStoredValue(valueToStore)
        // Sauvegarder dans localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
          // Déclencher un événement personnalisé pour notifier les autres composants
          window.dispatchEvent(new CustomEvent(`localStorage-${key}`, { detail: valueToStore }))
        }
      } catch (error) {
        console.log(error)
      }
    },
    [key, storedValue],
  )

  // Synchroniser avec d'autres onglets/fenêtres et composants
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue)
          setStoredValue(newValue)
        } catch (error) {
          console.log(error)
        }
      }
    }

    function handleCustomEvent(e: CustomEvent) {
      setStoredValue(e.detail)
    }

    // Écouter les changements dans localStorage (entre onglets)
    window.addEventListener("storage", handleStorageChange)
    // Écouter les événements personnalisés (dans le même onglet)
    window.addEventListener(`localStorage-${key}`, handleCustomEvent as EventListener)

    // Vérifier périodiquement les changements (fallback)
    const interval = setInterval(() => {
      try {
        const item = window.localStorage.getItem(key)
        if (item) {
          const currentValue = JSON.parse(item)
          if (JSON.stringify(currentValue) !== JSON.stringify(storedValue)) {
            setStoredValue(currentValue)
          }
        }
      } catch (error) {
        console.log(error)
      }
    }, 1000) // Vérifier toutes les secondes

    // Nettoyer les écouteurs d'événements
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener(`localStorage-${key}`, handleCustomEvent as EventListener)
      clearInterval(interval)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}
