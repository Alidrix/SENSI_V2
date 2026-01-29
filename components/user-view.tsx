"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Target,
  AlertTriangle,
  Lock,
  Mail,
  Wifi,
  FileText,
  Brain,
  CheckCircle,
  RefreshCw,
  Clock,
  ArrowDown,
  Building,
  HardDrive,
  UserCheck,
  Trophy,
  Download,
  BarChart3,
  Signal,
  Cog,
  Server,
  ShieldCheck,
} from "lucide-react"
import Image from "next/image"
import { Module2 } from "./module2"
import { Module3 } from "./module3"
import { Module4 } from "./module4"
import { ConclusionModule } from "./conclusion"
import { PhishingWorkshop } from "./phishing-workshop"

// Importer les fonctions de génération PDF
import { generateCertificatePDFAdvanced } from "./pdf-generator"
import { TrainingContent } from "@/lib/training-content"
import { recordScore } from "@/lib/scoreboard"

// Types pour l'état de la présentation
interface PresentationState {
  currentModule: number
  currentStep: number
  completedModules: number[]
  visibleSections: string[]
  lastModified: number
  isPlaying?: boolean
  autoAdvance?: boolean
  customContent?: any
  userProgress?: {
    [key: string]: any
  }
}

interface ParticipantInfo {
  id: string
  name?: string
}

export function UserView({
  presentationState,
  lastUpdate,
  setPresentationState,
  trainingContent,
  roomCode,
  participant,
}: {
  presentationState: PresentationState
  lastUpdate: number
  setPresentationState: React.Dispatch<React.SetStateAction<PresentationState>>
  trainingContent: TrainingContent
  roomCode: string
  participant?: ParticipantInfo
}) {
  const [localUpdate, setLocalUpdate] = useState(Date.now())
  const [previousVisibleSections, setPreviousVisibleSections] = useState<string[]>([])
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [userProgress, setUserProgress] = useState<{ [key: string]: any }>({})

  // Refs pour les sections
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Forcer la re-render quand l'état change
  useEffect(() => {
    setLocalUpdate(Date.now())
  }, [presentationState, lastUpdate])

  // Détecter les nouvelles sections et scroller automatiquement
  useEffect(() => {
    // Éviter le scroll au premier chargement
    if (previousVisibleSections.length === 0 && presentationState.visibleSections.length > 0) {
      setPreviousVisibleSections(presentationState.visibleSections)
      return
    }

    const newSections = presentationState.visibleSections.filter(
      (section) => !previousVisibleSections.includes(section),
    )

    if (newSections.length > 0) {
      // Prendre la dernière section ajoutée
      const latestSection = newSections[newSections.length - 1]

      // Attendre un peu pour que l'animation se termine
      setTimeout(() => {
        const sectionElement = sectionRefs.current[latestSection]
        if (sectionElement) {
          // Afficher l'indicateur de scroll
          setShowScrollIndicator(true)

          // Scroller vers la section avec une animation fluide
          sectionElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          })

          // Masquer l'indicateur après le scroll
          setTimeout(() => {
            setShowScrollIndicator(false)
          }, 1000)
        }
      }, 300) // Délai pour laisser l'animation CSS se terminer
    }

    setPreviousVisibleSections(presentationState.visibleSections)
  }, [presentationState.visibleSections, previousVisibleSections])

  // Fonction pour assigner les refs
  const setSectionRef = (sectionId: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[sectionId] = el
  }

  // Vérifier si une section est visible
  const isSectionVisible = (sectionId: string) => {
    return presentationState.visibleSections.includes(sectionId)
  }

  const logScore = (
    activity: string,
    score: number,
    total: number,
    type: "quiz" | "atelier",
  ) => {
    if (!roomCode) return
    recordScore(roomCode, {
      participantId: participant?.id || "participant-inconnu",
      participantName: participant?.name || "Participant",
      activity,
      score,
      total,
      timestamp: Date.now(),
      type,
    })
  }

  const activityLabels: Record<string, string> = {
    phishing: "Atelier phishing",
    "module-2": "Atelier emails suspects",
    "module-3": "Atelier classification",
    "conclusion-quiz": "Quiz final",
  }

  // Sauvegarder la progression utilisateur
  const saveUserProgress = (
    moduleId: string,
    progress: {
      score?: number
      total?: number
      activity?: string
      type?: "quiz" | "atelier"
      [key: string]: any
    },
  ) => {
    const newProgress = { ...userProgress, [moduleId]: progress }
    setUserProgress(newProgress)
    localStorage.setItem("user-progress", JSON.stringify(newProgress))

    if (progress?.score !== undefined && progress?.total) {
      const activity = progress.activity || activityLabels[moduleId] || moduleId
      const type = progress.type || (moduleId.includes("quiz") ? "quiz" : "atelier")

      logScore(activity, progress.score, progress.total, type)
    }
  }

  // Charger la progression utilisateur
  useEffect(() => {
    const savedProgress = localStorage.getItem("user-progress")
    if (savedProgress) {
      try {
        setUserProgress(JSON.parse(savedProgress))
      } catch (error) {
        console.error("Impossible de charger la progression locale", error)
        localStorage.removeItem("user-progress")
      }
    }
  }, [])

  // Modules disponibles avec étapes synchronisées
  const moduleIcons = [Target, Shield, Lock, FileText, AlertTriangle, CheckCircle]
  const modules = trainingContent.modules.map((module, index) => ({
    ...module,
    icon: moduleIcons[index] ?? FileText,
    displayNumber: index + 1,
    cleanTitle: module.title.replace(/^module\s*\d+[:\-]?\s*/i, "").trim() || module.title,
  }))

  // Obtenir le module actuel
  const currentModule = modules[presentationState.currentModule]

  if (!currentModule) {
    return (
      <Card className="animate-in slide-in-from-bottom-4 duration-500">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <h3 className="text-lg font-medium">Contenu de formation indisponible</h3>
            <p className="text-gray-500">
              Une erreur s'est produite lors du chargement du module actuel. Merci de rafraîchir la page pour réessayer.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentStepTitle = currentModule.stepTitles[presentationState.currentStep] || currentModule.title

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
      {/* Indicateur de scroll */}
      {showScrollIndicator && (
        <div className="fixed top-1/2 right-8 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg animate-bounce">
          <ArrowDown className="h-5 w-5" />
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Plan de formation
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon
              const isCompleted = presentationState.completedModules.includes(module.id)
              const isCurrent = presentationState.currentModule === module.id
              const hasProgress = userProgress[`module-${module.id}`]

              return (
                <div
                  key={module.id}
                  className={`w-full flex items-center p-3 rounded-md transition-all duration-300 ${
                    isCurrent ? "bg-blue-600 text-white shadow-lg" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className={`p-1.5 rounded-md transition-all duration-300 ${
                        isCurrent
                          ? "bg-white/20"
                          : module.id === 0
                            ? "bg-blue-100"
                            : module.id === 1
                              ? "bg-green-100"
                              : module.id === 2
                                ? "bg-purple-100"
                                : module.id === 3
                                  ? "bg-orange-100"
                                  : module.id === 4
                                    ? "bg-red-100"
                                    : "bg-emerald-100"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 transition-all duration-300 ${
                          isCurrent
                            ? "text-white"
                            : module.id === 0
                              ? "text-blue-600"
                              : module.id === 1
                                ? "text-green-600"
                                : module.id === 2
                                  ? "text-purple-600"
                                  : module.id === 3
                                    ? "text-orange-600"
                                    : module.id === 4
                                      ? "text-red-600"
                                      : "text-emerald-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium ${isCurrent ? "text-white" : "text-gray-900"}`}>
                        Module {module.displayNumber}
                      </div>
                      <div className={`text-xs ${isCurrent ? "text-white/80" : "text-gray-500"}`}>{module.cleanTitle}</div>
                      {isCurrent && (
                        <div className="text-xs text-white/60 mt-1">
                          Étape {presentationState.currentStep + 1}/{module.steps.length}
                        </div>
                      )}
                      {hasProgress && !isCurrent && (
                        <div className="text-xs text-blue-600 mt-1">Progression sauvée</div>
                      )}
                    </div>
                    {isCompleted && (
                      <CheckCircle className={`h-4 w-4 ${isCurrent ? "text-white" : "text-green-500"}`} />
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Indicateur de statut en temps réel */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-900">Formation en cours</span>
              </div>
              <div className="text-sm text-blue-700">
                {currentModule.title} - {currentStepTitle}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module 1: Introduction */}
        {presentationState.currentModule === 0 && (
          <>
            {/* Introduction générale */}
            {isSectionVisible("intro") && (
              <div ref={setSectionRef("intro")}>
                <Card className="animate-in slide-in-from-bottom-4 duration-500 scroll-mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-6 w-6 text-blue-600" />
                      Bienvenue à la formation cybersécurité
                    </CardTitle>
                    <CardDescription>Formation interactive en cybersécurité</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        Cette formation interactive vous permettra d'acquérir les connaissances essentielles en matière
                        de cybersécurité et de développer les bons réflexes face aux menaces numériques.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">🎯 Ce que vous allez apprendre</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Identifier et comprendre les principales menaces cyber</li>
                          <li>• Adopter les bonnes pratiques de sécurité au quotidien</li>
                          <li>• Protéger efficacement les données sensibles</li>
                          <li>• Réagir correctement face à un incident de sécurité</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Objectifs - contenu unique */}
            {isSectionVisible("objectifs") && (
              <div ref={setSectionRef("objectifs")}>
                <Card className="animate-in slide-in-from-bottom-4 duration-500 scroll-mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-6 w-6 text-blue-600" />
                      Objectifs de la formation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold mb-4">📊 Statistiques clés</h3>
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">95%</div>
                            <div className="text-sm text-gray-600">des cyberattaques sont dues à l'erreur humaine</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600">4.45M€</div>
                            <div className="text-sm text-gray-600">coût moyen d'une violation de données</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold mb-4">🎯 Méthode pédagogique</h3>
                        <ul className="text-sm space-y-2">
                          <li>• Modules théoriques interactifs</li>
                          <li>• Ateliers pratiques</li>
                          <li>• Simulations d'incidents</li>
                          <li>• Quiz d'évaluation</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Déroulement - contenu unique */}
            {isSectionVisible("deroulement") && (
              <div ref={setSectionRef("deroulement")}>
                <Card className="animate-in slide-in-from-bottom-4 duration-500 scroll-mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-6 w-6 text-blue-600" />
                      Programme de la formation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[ 
                        {
                          num: 1,
                          title: "Introduction à la cybersécurité",
                          duration: "20 min",
                          desc: "Concepts, menaces, atelier phishing",
                        },
                        {
                          num: 2,
                          title: "Bonnes pratiques de sécurité",
                          duration: "30 min",
                          desc: "Mots de passe, appareils, emails",
                        },
                        {
                          num: 3,
                          title: "Protection des données",
                          duration: "25 min",
                          desc: "Risques internes, classification RGPD",
                        },
                        {
                          num: 4,
                          title: "Réaction aux incidents",
                          duration: "25 min",
                          desc: "Détection, plan de réaction",
                        },
                        {
                          num: 5,
                          title: "Conclusion et évaluation",
                          duration: "20 min",
                          desc: "Synthèse, quiz, certificat",
                        },
                      ].map((module) => (
                        <div key={module.num} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                            {module.num}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{module.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {module.duration}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{module.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Présentation C'CIN - contenu unique */}
            {isSectionVisible("ccin") && (
              <div ref={setSectionRef("ccin")}>
                <Card className="animate-in slide-in-from-bottom-4 duration-500 scroll-mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-6 w-6 text-blue-600" />À propos de C'CIN
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <Image
                          src="/images/logo-ccin.png"
                          alt="C'CIN Logo"
                          width={80}
                          height={40}
                          className="h-8 w-auto"
                        />
                        <div>
                          <h3 className="font-semibold text-blue-900">Chartres Innovations Numériques</h3>
                          <p className="text-sm text-blue-700">
                            Votre partenaire pour la transformation numérique sécurisée
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-blue-800 mb-4">
                        C'CIN accompagne les entreprises et collectivités du territoire chartrain dans leur
                        transformation numérique en proposant des solutions sécurisées et innovantes.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          {
                            title: "Télécoms",
                            icon: Signal,
                            items: [
                              "Abonnements fibre optique",
                              "Téléphonie VoIP",
                              "Hotspot WiFi",
                              "Offre FDN",
                            ],
                            colors: {
                              container: "bg-orange-50 border-orange-100",
                              text: "text-orange-900",
                              icon: "bg-orange-500 text-white",
                            },
                          },
                          {
                            title: "Infogérance",
                            icon: Cog,
                            items: ["Prestations informatiques", "Office 365", "Zendoc", "Solutions sécurisées"],
                            colors: {
                              container: "bg-teal-50 border-teal-100",
                              text: "text-teal-900",
                              icon: "bg-teal-500 text-white",
                            },
                          },
                          {
                            title: "Hébergement",
                            icon: Server,
                            items: ["Hébergement physique", "Hébergement virtuel", "Solutions de sauvegarde"],
                            colors: {
                              container: "bg-rose-50 border-rose-100",
                              text: "text-rose-900",
                              icon: "bg-rose-500 text-white",
                            },
                          },
                          {
                            title: "Cybersécurité",
                            icon: ShieldCheck,
                            items: ["Audits", "Sensibilisation Cyber", "Escape Game Cyber"],
                            colors: {
                              container: "bg-indigo-50 border-indigo-100",
                              text: "text-indigo-900",
                              icon: "bg-indigo-500 text-white",
                            },
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className={`border rounded-xl p-3 h-full ${item.colors.container} shadow-sm`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-semibold ${item.colors.icon}`}
                              >
                                <item.icon className="h-6 w-6" />
                              </div>
                              <h4 className={`text-base font-semibold ${item.colors.text}`}>{item.title}</h4>
                            </div>
                            <ul className="space-y-1">
                              {item.items.map((service) => (
                                <li key={service} className={`${item.colors.text} text-xs flex items-start gap-1`}>
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                                  <span>{service}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Module 2: Introduction à la cybersécurité */}
        {presentationState.currentModule === 1 && (
          <>
            {/* Concepts de base */}
            {isSectionVisible("concepts") && (
              <div ref={setSectionRef("concepts")}>
                <Card className="animate-in slide-in-from-bottom-4 duration-500 scroll-mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-green-600" />
                      Module 2 : Concepts de base
                    </CardTitle>
                    <CardDescription>Les fondamentaux de la cybersécurité</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-4">🔐 La triade CID</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-green-200 bg-white">
                          <CardContent className="p-4">
                            <Lock className="h-8 w-8 text-green-600 mb-2" />
                            <h3 className="font-semibold text-green-900 mb-2">Confidentialité</h3>
                            <p className="text-sm text-green-700">
                              Seules les personnes autorisées accèdent aux informations
                            </p>
                            <div className="mt-3 text-xs text-green-600">
                              <strong>Exemple :</strong> Chiffrement des données
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-white">
                          <CardContent className="p-4">
                            <CheckCircle className="h-8 w-8 text-blue-600 mb-2" />
                            <h3 className="font-semibold text-blue-900 mb-2">Intégrité</h3>
                            <p className="text-sm text-blue-700">Les données ne sont pas altérées ou corrompues</p>
                            <div className="mt-3 text-xs text-blue-600">
                              <strong>Exemple :</strong> Signatures numériques
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-purple-200 bg-white">
                          <CardContent className="p-4">
                            <RefreshCw className="h-8 w-8 text-purple-600 mb-2" />
                            <h3 className="font-semibold text-purple-900 mb-2">Disponibilité</h3>
                            <p className="text-sm text-purple-700">Les systèmes fonctionnent quand on en a besoin</p>
                            <div className="mt-3 text-xs text-purple-600">
                              <strong>Exemple :</strong> Sauvegardes régulières
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold mb-4">🎯 Pourquoi la cybersécurité ?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Enjeux business</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Protection de la réputation</li>
                            <li>• Continuité d'activité</li>
                            <li>• Conformité réglementaire</li>
                            <li>• Avantage concurrentiel</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Risques</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Pertes financières</li>
                            <li>• Vol de données clients</li>
                            <li>• Arrêt de production</li>
                            <li>• Sanctions légales</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Principales menaces */}
            {isSectionVisible("menaces") && (
              <div ref={setSectionRef("menaces")}>
                <Card className="animate-in slide-in-from-bottom-4 duration-500 scroll-mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-green-600" />
                      Principales menaces
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                      <h3 className="font-semibold text-red-900 mb-4">⚠️ Paysage des menaces</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Mail className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-red-900">Phishing & Social Engineering</h4>
                              <p className="text-sm text-red-700 mb-2">Emails frauduleux, aranaque au président</p>
                              <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                                <strong>85%</strong> des violations commencent par du phishing
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <HardDrive className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-red-900">Malware & Ransomware</h4>
                              <p className="text-sm text-red-700 mb-2">Virus, ransomware, cheval de Troie</p>
                              <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                                Coût moyen d'un ransomware : <strong>4.54M€</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Wifi className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-red-900">Attaques réseau</h4>
                              <p className="text-sm text-red-700 mb-2">DDOS, man-in-the-middle, spoofing</p>
                              <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                                <strong>43%</strong> des attaques visent les PME
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <UserCheck className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-red-900">Menaces internes</h4>
                              <p className="text-sm text-red-700 mb-2">Employés malveillants ou négligents</p>
                              <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                                <strong>34%</strong> des incidents sont internes
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">🔍 Tendances actuelles</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="text-sm">
                          <strong className="text-yellow-800">IA malveillante</strong>
                          <p className="text-yellow-700">Deepfakes, attaques automatisées</p>
                        </div>
                        <div className="text-sm">
                          <strong className="text-yellow-800">Supply chain</strong>
                          <p className="text-yellow-700">Attaques via les fournisseurs</p>
                        </div>
                        <div className="text-sm">
                          <strong className="text-yellow-800">Cloud & IoT</strong>
                          <p className="text-yellow-700">Nouvelles surfaces d'attaque</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Atelier phishing */}
            {isSectionVisible("atelier-phishing") && (
              <div ref={setSectionRef("atelier-phishing")}>
                <PhishingWorkshop onProgress={(progress) => saveUserProgress("phishing", progress)} />
              </div>
            )}
          </>
        )}

        {/* Module 3: Bonnes pratiques */}
        {presentationState.currentModule === 2 && (
          <>
            {isSectionVisible("module2-intro") && (
              <div ref={setSectionRef("module2-intro")}>
                <Card className="animate-in slide-in-from-bottom-4 duration-500 scroll-mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-6 w-6 text-purple-600" />
                      Module 3 : Les bonnes pratiques de sécurité numérique
                    </CardTitle>
                    <CardDescription>Focus sur les réflexes essentiels à adopter</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-4">🎯 Objectifs de ce module</h3>
                      <ul className="text-sm text-purple-800 space-y-2">
                        <li>• Identifier les bons réflexes du quotidien</li>
                        <li>• Comprendre les priorités de sécurité essentielles</li>
                        <li>• Mettre en pratique avec des ateliers interactifs</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {(isSectionVisible("module2-intro") || isSectionVisible("module2-ateliers")) && (
              <div ref={setSectionRef("module2-content")}>
                <Module2
                  onComplete={(details) =>
                    saveUserProgress("module-2", {
                      ...details,
                      completed: true,
                      timestamp: Date.now(),
                    })
                  }
                  onNext={() => {}}
                  currentStep={presentationState.currentStep}
                  visibleSections={presentationState.visibleSections}
                />
              </div>
            )}
          </>
        )}

        {/* Module 4: Protection des données */}
        {presentationState.currentModule === 3 && (
          <>
            {isSectionVisible("module3-intro") && (
              <div ref={setSectionRef("module3-intro")}>
                <Card className="animate-in slide-in-from-bottom-4 duration-500 scroll-mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-6 w-6 text-orange-600" />
                      Module 4 : Protection des données sensibles et risques internes
                    </CardTitle>
                    <CardDescription>Gérer les accès et protéger les informations critiques</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
                      <h3 className="font-semibold text-orange-900 mb-4">🎯 Objectifs de ce module</h3>
                      <ul className="text-sm text-orange-800 space-y-2">
                        <li>• Identifier et prévenir les risques internes</li>
                        <li>• Classifier correctement les données sensibles</li>
                        <li>• Appliquer les principes du RGPD</li>
                        <li>• Contrôler les accès et la traçabilité</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {(isSectionVisible("module3-risques") ||
              isSectionVisible("module3-classification") ||
              isSectionVisible("module3-ateliers")) && (
              <div ref={setSectionRef("module3-content")}>
                <Module3
                  onComplete={(details) =>
                    saveUserProgress("module-3", {
                      ...details,
                      completed: true,
                      timestamp: Date.now(),
                    })
                  }
                  onNext={() => {}}
                  currentStep={presentationState.currentStep}
                  visibleSections={presentationState.visibleSections}
                />
              </div>
            )}
          </>
        )}

        {/* Module 5: Réagir aux incidents */}
        {presentationState.currentModule === 4 && (
          <>
            {isSectionVisible("module4-intro") && (
              <div ref={setSectionRef("module4-intro")}>
                <Card className="animate-in slide-in-from-bottom-4 duration-500 scroll-mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                      Module 5 : Réagir face à un incident de cybersécurité
                    </CardTitle>
                    <CardDescription>Reconnaître et gérer efficacement les incidents</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                      <h3 className="font-semibold text-red-900 mb-4">🎯 Objectifs de ce module</h3>
                      <ul className="text-sm text-red-800 space-y-2">
                        <li>• Reconnaître rapidement un incident de sécurité</li>
                        <li>• Appliquer le bon plan de réaction</li>
                        <li>• Savoir qui alerter et comment</li>
                        <li>• Pratiquer avec des simulations réalistes</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {(isSectionVisible("module4-detection") ||
              isSectionVisible("module4-reaction") ||
              isSectionVisible("module4-atelier")) && (
              <div ref={setSectionRef("module4-content")}>
                <Module4
                  onComplete={() => saveUserProgress("module-4", { completed: true, timestamp: Date.now() })}
                  onNext={() => {}}
                  currentStep={presentationState.currentStep}
                  visibleSections={presentationState.visibleSections}
                />
              </div>
            )}
          </>
        )}

        {/* Module 6: Conclusion */}
        {presentationState.currentModule === 5 && (
          <>
            {(isSectionVisible("conclusion-synthese") ||
              isSectionVisible("conclusion-ressources") ||
              isSectionVisible("conclusion-quiz")) && (
              <div ref={setSectionRef("conclusion-content")}>
                <ConclusionModule
                  onComplete={() => {
                    saveUserProgress("conclusion", { completed: true, timestamp: Date.now() })
                    // Marquer la formation comme terminée
                    setPresentationState({
                      ...presentationState,
                      currentStep: 3, // Aller à l'étape certificat
                      visibleSections: [...presentationState.visibleSections, "conclusion-certificat"],
                      completedModules: [...presentationState.completedModules, 5],
                      lastModified: Date.now(),
                    })
                  }}
                  onQuizComplete={(score, total) =>
                    saveUserProgress("conclusion-quiz", { score, total, completed: true, timestamp: Date.now() })
                  }
                  currentStep={presentationState.currentStep}
                  visibleSections={presentationState.visibleSections}
                />
              </div>
            )}

            {isSectionVisible("conclusion-certificat") && (
              <div ref={setSectionRef("conclusion-certificat")}>
                <CompletionCertificate userProgress={userProgress} participant={participant} />
              </div>
            )}
          </>
        )}

        {/* Message d'attente si aucune section n'est visible */}
        {presentationState.visibleSections.length === 0 && (
          <Card className="animate-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                <h3 className="text-lg font-medium">En attente du formateur</h3>
                <p className="text-gray-500">Le formateur contrôle l'affichage du contenu. Veuillez patienter.</p>
                <div className="mt-4 text-sm text-gray-400">
                  Prochaine étape : {currentStepTitle}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Composant de certificat de fin de formation
function CompletionCertificate({
  userProgress,
  participant,
}: {
  userProgress: { [key: string]: any }
  participant?: ParticipantInfo
}) {
  const [showCertificate, setShowCertificate] = useState(false)
  const [participantName, setParticipantName] = useState(participant?.name || "")

  useEffect(() => {
    if (participant?.name && !participantName) {
      setParticipantName(participant.name)
    }
  }, [participant?.name, participantName])

  // Calculer le score global
  const calculateGlobalScore = () => {
    let totalScore = 0
    let totalQuestions = 0

    // Score phishing
    if (userProgress.phishing) {
      totalScore += userProgress.phishing.score || 0
      totalQuestions += userProgress.phishing.total || 4
    }

    // Score conclusion quiz
    if (userProgress["conclusion-quiz"]) {
      totalScore += userProgress["conclusion-quiz"].score || 0
      totalQuestions += userProgress["conclusion-quiz"].total || 15
    }

    return totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0
  }

  const globalScore = calculateGlobalScore()
  const completionDate = new Date().toLocaleDateString("fr-FR")

  const generateCertificate = () => {
    if (!participantName.trim()) {
      alert("Veuillez entrer votre nom pour générer le certificat")
      return
    }
    setShowCertificate(true)
  }

  // Dans le composant CompletionCertificate, remplacer la fonction downloadCertificate :
  const downloadCertificate = () => {
      const certificateData = {
        name: participantName,
        score: globalScore,
        date: completionDate,
        modules: [
          "Introduction à la cybersécurité",
          "Bonnes pratiques de sécurité",
          "Protection des données sensibles",
          "Réaction aux incidents",
        ],
      organisme: "C'Chartres Innovations Numériques",
      }

    // Générer le PDF
    generateCertificatePDFAdvanced(certificateData)
  }

  const restartTraining = () => {
    if (confirm("Êtes-vous sûr de vouloir recommencer la formation ? Votre progression sera perdue.")) {
      localStorage.removeItem("user-progress")
      localStorage.removeItem("presentation-state")
      window.location.reload()
    }
  }

  return (
    <Card className="animate-in slide-in-from-bottom-4 duration-500 scroll-mt-8 border-emerald-200 bg-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-emerald-600" />🎉 Formation terminée avec succès !
        </CardTitle>
        <CardDescription>Félicitations ! Vous avez complété la formation cybersécurité</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showCertificate ? (
          <>
            {/* Résumé de performance */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                Votre performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{globalScore}%</div>
                  <div className="text-sm text-gray-600">Score global</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">6/6</div>
                  <div className="text-sm text-gray-600">Modules complétés</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{Object.keys(userProgress).length}</div>
                  <div className="text-sm text-gray-600">Ateliers réalisés</div>
                </div>
              </div>
            </div>

            {/* Génération du certificat */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Générer votre certificat
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="participant-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du participant
                  </label>
                  <input
                    id="participant-name"
                    type="text"
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Entrez votre nom complet"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                  />
                </div>
                <Button onClick={generateCertificate} className="w-full" size="lg">
                  <Trophy className="h-4 w-4 mr-2" />
                  Générer le certificat
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Certificat */}
            <div className="bg-white p-8 rounded-lg border-2 border-emerald-300 shadow-lg">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <Image src="/images/logo-ccin.png" alt="C'CIN Logo" width={120} height={60} className="h-12 w-auto" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">CERTIFICAT DE FORMATION</h2>
                  <h3 className="text-xl text-emerald-600 font-semibold">Cybersécurité - Sensibilisation</h3>
                </div>

                <div className="py-6">
                  <p className="text-gray-700 mb-4">Certifie que</p>
                  <p className="text-2xl font-bold text-gray-900 mb-4">{participantName}</p>
                  <p className="text-gray-700 mb-4">a suivi avec succès la formation</p>
                  <p className="text-lg font-semibold text-emerald-600 mb-4">
                    "Cybersécurité : Bonnes pratiques et sensibilisation"
                  </p>
                  <p className="text-gray-700">
                    avec un score de <span className="font-bold text-emerald-600">{globalScore}%</span>
                  </p>
                </div>

                <div className="border-t pt-6">
                  <div className="grid grid-cols-2 gap-8 text-sm text-gray-600">
                    <div>
                      <p className="font-medium">Date de formation</p>
                      <p>{completionDate}</p>
                    </div>
                    <div>
                      <p className="font-medium">Organisme</p>
                      <p>C'Chartres Innovations Numériques</p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 border-t pt-4">
                  <p>
                    Formation interactive - Durée : 2h - Modules : Introduction, Bonnes pratiques, Protection des
                    données, Gestion d'incidents
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <Button onClick={downloadCertificate} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Télécharger PDF
              </Button>
              <Button onClick={() => window.print()} variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Imprimer
              </Button>
              <Button onClick={restartTraining} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Recommencer
              </Button>
            </div>
          </>
        )}

        {/* Ressources post-formation */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-4">📚 Pour aller plus loin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Ressources recommandées</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Guide ANSSI de la cybersécurité</li>
                <li>• Kit de sensibilisation CNIL</li>
                <li>• Formations complémentaires C'CIN</li>
                <li>• Veille sécurité mensuelle</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Contacts utiles</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• formation@ccin.fr</li>
                <li>• urgence@ccin.fr</li>
                <li>• contact@ccin.fr</li>
                <li>
                  •{" "}
                  <a
                    href="https://cybereponse.fr/"
                    className="underline underline-offset-2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Cybereponse
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
