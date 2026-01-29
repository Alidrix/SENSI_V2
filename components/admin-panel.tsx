"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { TrainingContent } from "@/lib/training-content"
import { getScores, ScoreEntry } from "@/lib/scoreboard"
import {
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  Shield,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Settings,
  Download,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Trash2,
  Timer,
} from "lucide-react"

// Types pour l'état de la présentation
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

export function AdminPanel({
  presentationState,
  setPresentationState,
  onExit,
  isLoading = false,
  trainingContent,
  roomCode,
  connectionCount,
}: {
  presentationState: PresentationState
  setPresentationState: (state: PresentationState) => void
  onExit: () => void
  isLoading?: boolean
  trainingContent: TrainingContent
  roomCode: string
  connectionCount: number
}) {
  const [activeTab, setActiveTab] = useState("navigation")
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [contentDraft, setContentDraft] = useState(presentationState.customContent || {})
  const [clearingSupabase, setClearingSupabase] = useState(false)
  const [clearMessage, setClearMessage] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)

  // Modules disponibles
  const moduleIcons = [Target, Shield, Lock, FileText, AlertTriangle, CheckCircle]
  const moduleDurations = [15, 20, 25, 25, 20, 15]

  const modules = trainingContent.modules.map((module) => ({
    ...module,
    icon: moduleIcons[module.id] ?? FileText,
    duration: moduleDurations[module.id] || 15,
  }))

  if (modules.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-3 text-gray-600">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <p>Impossible de charger le contenu de la formation.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const safeModuleIndex = Math.min(Math.max(presentationState.currentModule, 0), modules.length - 1)
  const safeModule = modules[safeModuleIndex]
  const safeStepIndex = Math.min(
    Math.max(presentationState.currentStep, 0),
    Math.max(safeModule.steps.length - 1, 0),
  )

  // Obtenir le module et l'étape actuels
  const currentModule = safeModule
  const currentStepIndex = safeStepIndex
  const currentStepId = currentModule.steps[currentStepIndex]

  useEffect(() => {
    if (!roomCode) return
    const fetchScores = async () => {
      const latest = await getScores(roomCode)
      setScores(latest)
    }

    fetchScores()
    const interval = setInterval(fetchScores, 3000)
    return () => clearInterval(interval)
  }, [roomCode])

  useEffect(() => {
    setContentDraft(presentationState.customContent || {})
  }, [presentationState.customContent])

  useEffect(() => {
    if (!modules.length) return
    const clampedModule = Math.min(Math.max(presentationState.currentModule, 0), modules.length - 1)
    const clampedStep = Math.min(
      Math.max(presentationState.currentStep, 0),
      Math.max(modules[clampedModule].steps.length - 1, 0),
    )

    if (clampedModule === presentationState.currentModule && clampedStep === presentationState.currentStep) {
      return
    }

    const updatedVisibleSections = [...presentationState.visibleSections]
    const fallbackStepId = modules[clampedModule].steps[clampedStep]
    if (fallbackStepId && !updatedVisibleSections.includes(fallbackStepId)) {
      updatedVisibleSections.push(fallbackStepId)
    }

    setPresentationState({
      ...presentationState,
      currentModule: clampedModule,
      currentStep: clampedStep,
      visibleSections: updatedVisibleSections,
      lastModified: Date.now(),
    })
  }, [
    modules,
    presentationState.currentModule,
    presentationState.currentStep,
    presentationState.visibleSections,
    setPresentationState,
  ])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [timerRunning])

  const clearSupabase = async () => {
    setClearingSupabase(true)
    setClearMessage(null)

    try {
      const response = await fetch("/api/admin/clear-supabase", { method: "POST" })
      if (!response.ok) {
        throw new Error("Failed to clear Supabase")
      }

      setClearMessage("Données Supabase effacées ✅")
    } catch (error) {
      console.error("Clear Supabase failed", error)
      setClearMessage("Impossible de nettoyer Supabase")
    } finally {
      setClearingSupabase(false)
    }
  }

  // Calculer la progression globale
  const totalSteps = modules.reduce((acc, module) => acc + module.steps.length, 0)
  const activeModuleSteps = modules[presentationState.currentModule]?.steps.length ?? 0
  const completedSteps =
    modules.slice(0, presentationState.currentModule).reduce((acc, module) => acc + module.steps.length, 0) +
    Math.min(presentationState.currentStep + 1, activeModuleSteps)
  const globalProgress = Math.min(100, Math.round((completedSteps / totalSteps) * 100))

  // Navigation entre les étapes
  const goToNextStep = () => {
    if (isLoading) return

    if (currentStepIndex < currentModule.steps.length - 1) {
      // Passer à l'étape suivante dans le même module
      setPresentationState({
        ...presentationState,
        currentStep: currentStepIndex + 1,
        visibleSections: [...presentationState.visibleSections, currentModule.steps[currentStepIndex + 1]],
      })
    } else if (presentationState.currentModule < modules.length - 1) {
      // Passer au module suivant
      const nextModule = modules[presentationState.currentModule + 1]
      setPresentationState({
        ...presentationState,
        currentModule: presentationState.currentModule + 1,
        currentStep: 0,
        completedModules: [...presentationState.completedModules, presentationState.currentModule],
        visibleSections: [...presentationState.visibleSections, nextModule.steps[0]],
      })
    }
  }

  const goToPreviousStep = () => {
    if (isLoading) return

    if (currentStepIndex > 0) {
      // Revenir à l'étape précédente dans le même module
      setPresentationState({
        ...presentationState,
        currentStep: currentStepIndex - 1,
      })
    } else if (presentationState.currentModule > 0) {
      // Revenir au module précédent
      const prevModule = modules[presentationState.currentModule - 1]
      setPresentationState({
        ...presentationState,
        currentModule: presentationState.currentModule - 1,
        currentStep: prevModule.steps.length - 1,
        completedModules: presentationState.completedModules.filter((id) => id !== presentationState.currentModule - 1),
      })
    }
  }

  // Navigation directe vers un module et une étape spécifiques
  const goToSpecificStep = (moduleId: number, stepIndex: number) => {
    if (isLoading) return

    const targetModule = modules[moduleId]
    const newVisibleSections = [...presentationState.visibleSections]

    // Ajouter la section cible si elle n'est pas déjà visible
    if (!newVisibleSections.includes(targetModule.steps[stepIndex])) {
      newVisibleSections.push(targetModule.steps[stepIndex])
    }

    setPresentationState({
      ...presentationState,
      currentModule: moduleId,
      currentStep: stepIndex,
      visibleSections: newVisibleSections,
    })
  }

  // Révéler toutes les sections d'un module
  const revealModule = (moduleId: number) => {
    if (isLoading) return

    const targetModule = modules[moduleId]
    const newVisibleSections = [...new Set([...presentationState.visibleSections, ...targetModule.steps])]

    setPresentationState({
      ...presentationState,
      visibleSections: newVisibleSections,
    })
  }

  // Contrôle de visibilité des sections
  const toggleSectionVisibility = (sectionId: string) => {
    if (isLoading) return

    if (presentationState.visibleSections.includes(sectionId)) {
      setPresentationState({
        ...presentationState,
        visibleSections: presentationState.visibleSections.filter((id) => id !== sectionId),
      })
    } else {
      setPresentationState({
        ...presentationState,
        visibleSections: [...presentationState.visibleSections, sectionId],
      })
    }
  }

  const startTimer = () => setTimerRunning(true)

  const stopTimer = () => setTimerRunning(false)

  const resetTimer = () => {
    setTimerRunning(false)
    setTimerSeconds(0)
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0")
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0")
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, "0")

    return `${hours}:${minutes}:${seconds}`
  }

  // Exporter les données de session
  const exportSessionData = () => {
    const sessionData = {
      presentationState,
      timestamp: new Date().toISOString(),
      modules,
      totalDuration: modules.reduce((acc, module) => acc + module.duration, 0),
    }

    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `formation-cybersecurite-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function ModuleList({
    modules,
    presentationState,
    isLoading,
    goToSpecificStep,
    revealModule,
    showVisibility,
    toggleSectionVisibility,
  }: {
    modules: typeof modules
    presentationState: PresentationState
    isLoading: boolean
    goToSpecificStep: (moduleId: number, stepIndex: number) => void
    revealModule: (moduleId: number) => void
    showVisibility?: boolean
    toggleSectionVisibility?: (sectionId: string) => void
  }) {
    return (
      <div className="bg-white p-4 rounded-lg border overflow-auto max-h-96">
        {modules.map((module) => (
          <div
            key={module.id}
            className="mb-4 border-l-4 pl-4"
            style={{ borderColor: "#3b82f6" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <module.icon className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium text-blue-700">
                  Module {module.id + 1}: {module.title}
                </h3>
                <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 bg-blue-50">
                  {module.duration}min
                </Badge>
              </div>
              {!showVisibility && (
                <Button
                  onClick={() => revealModule(module.id)}
                  disabled={isLoading}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600 hover:bg-blue-50"
                >
                  Révéler tout
                </Button>
              )}
            </div>
            <ul className="pl-2 space-y-1">
              {module.steps.map((stepId, stepIndex) => {
                const isActive =
                  presentationState.currentModule === module.id &&
                  presentationState.currentStep === stepIndex
                const isVisible = presentationState.visibleSections.includes(stepId)
                return (
                  <li key={stepId}>
                    {!showVisibility ? (
                      <Button
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        disabled={isLoading}
                        className={`w-full justify-start text-left rounded-md ${
                          isActive
                            ? "bg-blue-100 border-blue-400 text-blue-900"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-blue-50"
                        }`}
                        onClick={() => goToSpecificStep(module.id, stepIndex)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              isActive ? "bg-blue-200 text-blue-900" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {stepIndex + 1}/{module.steps.length}
                          </span>
                          <span className="flex-1 truncate">{module.stepTitles[stepIndex]}</span>
                          {isVisible && <Eye className="h-3 w-3 text-green-500" />}
                        </div>
                      </Button>
                    ) : (
                      <Button
                        key={stepId}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        className={`w-full justify-between text-left ${isVisible ? "border-green-500 bg-green-50" : "border-gray-300"}`}
                        onClick={() => toggleSectionVisibility && toggleSectionVisibility(stepId)}
                      >
                        <span>{module.stepTitles[stepIndex]}</span>
                        {isVisible ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Shield className="h-6 w-6" />
            Interface Administrateur
            <Badge variant="destructive" className="ml-auto">
              LIVE
            </Badge>
          </CardTitle>
          <CardDescription className="text-red-700">
            Contrôlez la présentation pour tous les participants
            {isLoading && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Synchronisation...
              </span>
            )}
            {presentationState.sessionId && (
              <span className="ml-2 text-xs">Session: {presentationState.sessionId.slice(-8)}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{globalProgress}%</div>
                    <div className="text-xs text-gray-500">Progression globale</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{formatTime(timerSeconds)}</div>
                      <div className="text-xs text-gray-500">Chronomètre</div>
                    </div>
                  </div>
                  <div className="flex flex-nowrap items-center gap-2 sm:justify-end">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={startTimer}
                      disabled={timerRunning}
                      aria-label="Démarrer le chronomètre"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={stopTimer}
                      disabled={!timerRunning}
                      aria-label="Arrêter le chronomètre"
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={resetTimer}
                      disabled={timerSeconds === 0}
                      aria-label="Réinitialiser le chronomètre"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {presentationState.completedModules.length}
                    </div>
                    <div className="text-xs text-gray-500">Modules terminés</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {modules.reduce((acc, module) => acc + module.duration, 0)}min
                    </div>
                    <div className="text-xs text-gray-500">Durée totale</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="scores">Scores</TabsTrigger>
            </TabsList>

            {/* Onglet Navigation */}
            <TabsContent value="navigation" className="space-y-4">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 text-center lg:text-left">
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg">Position actuelle</h3>
                    <p className="text-sm text-gray-500">
                      Module {safeModuleIndex + 1}: {currentModule.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Étape {currentStepIndex + 1}/{currentModule.steps.length}:{" "}
                      {currentModule.stepTitles[currentStepIndex]}
                    </p>
                  </div>
                  <div className="flex flex-col items-center lg:items-end">
                    <div className="text-sm text-gray-500 mb-2">Progression globale</div>
                    <Progress value={globalProgress} className="w-32 h-3" />
                    <div className="text-xs text-gray-400 mt-1">{globalProgress}%</div>
                  </div>
                </div>

                {/* Contrôles de lecture */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Button
                    onClick={goToPreviousStep}
                    disabled={(presentationState.currentModule === 0 && currentStepIndex === 0) || isLoading}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <SkipBack className="h-4 w-4" />
                    Précédent
                  </Button>

                  <Button
                    onClick={goToNextStep}
                    disabled={
                      (presentationState.currentModule === modules.length - 1 &&
                        currentStepIndex === modules[modules.length - 1].steps.length - 1) ||
                      isLoading
                    }
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    Suivant
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportSessionData} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exporter
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={clearSupabase}
                    disabled={isLoading || clearingSupabase}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {clearingSupabase ? "Nettoyage..." : "Clear Supabase"}
                  </Button>
                </div>
                <Button variant="destructive" onClick={onExit} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Quitter le mode admin
                </Button>
              </div>
            </TabsContent>

            {/* Onglet Paramètres */}
            <TabsContent value="settings" className="space-y-4">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres de session
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Durée totale estimée</label>
                      <div className="text-lg font-semibold text-blue-600">
                        {modules.reduce((acc, module) => acc + module.duration, 0)} minutes
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sections disponibles</label>
                      <div className="text-lg font-semibold text-green-600">
                        {modules.reduce((acc, module) => acc + module.steps.length, 0)} étapes
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Actions rapides</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          const allSections = modules.flatMap((module) => module.steps)
                          setPresentationState({
                            ...presentationState,
                            visibleSections: allSections,
                          })
                        }}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Révéler tout
                      </Button>
                      <Button
                        onClick={() => {
                          setPresentationState({
                            ...presentationState,
                            visibleSections: [currentStepId],
                          })
                        }}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Masquer tout sauf actuel
                      </Button>
                      <Button
                        onClick={() => {
                          setPresentationState({
                            ...presentationState,
                            currentModule: modules.length - 1,
                            currentStep: modules[modules.length - 1].steps.length - 1,
                            completedModules: modules.slice(0, -1).map((m) => m.id),
                            visibleSections: [...presentationState.visibleSections, "conclusion-certificat"],
                          })
                        }}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Aller à la fin
                      </Button>
                      <Button
                        onClick={clearSupabase}
                        disabled={isLoading || clearingSupabase}
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {clearingSupabase ? "Nettoyage..." : "Clear Supabase"}
                      </Button>
                    </div>
                    {clearMessage && <p className="text-xs text-gray-500 mt-2">{clearMessage}</p>}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Informations de session</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Dernière modification : {new Date(presentationState.lastModified).toLocaleString()}</div>
                      {presentationState.sessionId && <div>Session ID : {presentationState.sessionId}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-lg">Éditer le contenu</h3>
                    <p className="text-sm text-gray-500">Ajustez le titre et le plan sans passer par GitHub</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button variant="outline" size="sm" onClick={() => setContentDraft({})}>
                      Réinitialiser le brouillon
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const mergedContent = {
                          title: contentDraft.title ?? trainingContent.title,
                          subtitle: contentDraft.subtitle ?? trainingContent.subtitle,
                          modules: trainingContent.modules.map((module) => {
                            const draft = contentDraft.modules?.find((m: any) => m.id === module.id)
                            return {
                              id: module.id,
                              title: draft?.title ?? module.title,
                              summary: draft?.summary ?? module.summary,
                            }
                          }),
                        }

                        setPresentationState({
                          ...presentationState,
                          customContent: mergedContent,
                          lastModified: Date.now(),
                        })
                        setContentDraft(mergedContent)
                        setSaveMessage("Contenu sauvegardé ✅")
                        setTimeout(() => setSaveMessage(null), 3000)
                      }}
                    >
                      Sauvegarder
                    </Button>
                  </div>
                </div>

                {saveMessage && <p className="text-xs text-green-600">{saveMessage}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Titre de la formation</label>
                    <Input
                      value={contentDraft.title ?? trainingContent.title}
                      onChange={(e) => setContentDraft({ ...contentDraft, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sous-titre</label>
                    <Input
                      value={contentDraft.subtitle ?? trainingContent.subtitle}
                      onChange={(e) => setContentDraft({ ...contentDraft, subtitle: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {modules.map((module) => {
                    const moduleDraft = contentDraft.modules?.find((m: any) => m.id === module.id) || {}
                    return (
                      <Card key={module.id} className="border-gray-200">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <module.icon className="h-4 w-4 text-blue-500" />
                              <h4 className="font-medium">Module {module.id + 1}</h4>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {module.steps.length} étapes
                            </Badge>
                          </div>
                          <Input
                            value={moduleDraft.title ?? module.title}
                            onChange={(e) => {
                              const modulesDraft = contentDraft.modules ? [...contentDraft.modules] : []
                              const targetIndex = modulesDraft.findIndex((m: any) => m.id === module.id)
                              if (targetIndex >= 0) {
                                modulesDraft[targetIndex] = { ...modulesDraft[targetIndex], title: e.target.value }
                              } else {
                                modulesDraft.push({ id: module.id, title: e.target.value })
                              }
                              setContentDraft({ ...contentDraft, modules: modulesDraft })
                            }}
                            placeholder="Titre du module"
                          />
                          <Input
                            value={moduleDraft.summary ?? module.summary}
                            onChange={(e) => {
                              const modulesDraft = contentDraft.modules ? [...contentDraft.modules] : []
                              const targetIndex = modulesDraft.findIndex((m: any) => m.id === module.id)
                              if (targetIndex >= 0) {
                                modulesDraft[targetIndex] = { ...modulesDraft[targetIndex], summary: e.target.value }
                              } else {
                                modulesDraft.push({ id: module.id, summary: e.target.value })
                              }
                              setContentDraft({ ...contentDraft, modules: modulesDraft })
                            }}
                            placeholder="Résumé ou objectif"
                          />
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scores" className="space-y-4">
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" /> Tableau des scores
                    </h3>
                    <p className="text-sm text-gray-500">Résultats des ateliers et quizz de la session</p>
                  </div>
                  <div className="text-sm text-gray-500">Participants actifs : {connectionCount}</div>
                </div>

                {scores.length === 0 ? (
                  <div className="text-sm text-gray-500">Aucun score enregistré pour le moment.</div>
                ) : (
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Participant</th>
                          <th className="text-left p-2">Activité</th>
                          <th className="text-left p-2">Score</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Horodatage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...scores]
                          .sort((a, b) => b.timestamp - a.timestamp)
                          .map((score) => (
                            <tr key={`${score.participantId}-${score.activity}-${score.type}`} className="border-b">
                              <td className="p-2 font-medium">{score.participantName || score.participantId}</td>
                              <td className="p-2">{score.activity}</td>
                              <td className="p-2">
                                <Badge variant="outline" className="text-xs">
                                  {score.score}/{score.total} ({Math.round((score.score / score.total) * 100)}%)
                                </Badge>
                              </td>
                              <td className="p-2 capitalize">{score.type}</td>
                              <td className="p-2 text-gray-500">
                                {new Date(score.timestamp).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
