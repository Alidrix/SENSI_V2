"use client"

import { useState, useEffect } from "react"

export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // État pour stocker notre valeur
  // Passer la fonction d'initialisation à useState pour que la logique ne s'exécute qu'une fois
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      // Récupérer depuis sessionStorage par clé
      const item = window.sessionStorage.getItem(key)
      // Analyser le JSON stocké ou retourner initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // En cas d'erreur, retourner initialValue
      console.log(error)
      return initialValue
    }
  })

  // Retourner une version enveloppée de la fonction setter de useState qui persiste la nouvelle valeur dans sessionStorage
  const setValue = (value: T) => {
    try {
      // Permettre à la valeur d'être une fonction pour avoir la même API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Sauvegarder l'état
      setStoredValue(valueToStore)
      // Sauvegarder dans sessionStorage
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // Une erreur plus sophistiquée serait mieux ici
      console.log(error)
    }
  }

  // Synchroniser avec d'autres onglets/fenêtres
  useEffect(() => {
    function handleStorageChange() {
      try {
        const item = window.sessionStorage.getItem(key)
        if (item) {
          setStoredValue(JSON.parse(item))
        }
      } catch (error) {
        console.log(error)
      }
    }

    // Écouter les changements dans sessionStorage
    window.addEventListener("storage", handleStorageChange)

    // Nettoyer l'écouteur d'événements
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [key])

  return [storedValue, setValue]
}
