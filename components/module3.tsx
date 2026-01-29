"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Shield, UserCheck, AlertTriangle, Brain, Lock, Eye, Users, Building, Globe } from "lucide-react"

export function Module3({
  onComplete,
  onNext,
  currentStep,
  visibleSections,
}: {
  onComplete: (details?: { score?: number; total?: number; activity?: string; type?: "quiz" | "atelier" }) => void
  onNext: () => void
  currentStep?: number
  visibleSections?: string[]
}) {
  const [currentWorkshop, setCurrentWorkshop] = useState<string | null>(null)

  // Vérifier si une section est visible
  const isSectionVisible = (sectionId: string) => {
    return visibleSections?.includes(sectionId) ?? true
  }

  return (
    <div className="space-y-6">
      {/* Contenu principal du module */}
      {(!visibleSections ||
        isSectionVisible("module3-intro") ||
        isSectionVisible("module3-risques") ||
        isSectionVisible("module3-classification")) && (
        <Card>
          <CardContent className="space-y-6 pt-4">
            <CardTitle className="flex items-center gap-2 text-black">
              <span aria-hidden="true">🧩</span>
              <span>Comprendre les enjeux</span>
            </CardTitle>
            {/* Risques internes - visible si étape correspondante */}
            {(!visibleSections || isSectionVisible("module3-risques")) && (
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Les risques internes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white border-red-200">
                    <CardContent className="p-4">
                      <AlertTriangle className="h-6 w-6 text-red-600 mb-2" />
                      <h4 className="font-medium text-red-900">Erreurs humaines</h4>
                      <p className="text-sm text-red-700 mt-1">Mauvaises manipulations, envois d'emails à tort</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border-red-200">
                    <CardContent className="p-4">
                      <Users className="h-6 w-6 text-red-600 mb-2" />
                      <h4 className="font-medium text-red-900">Négligences</h4>
                      <p className="text-sm text-red-700 mt-1">Mots de passe partagés, écrans non verrouillés</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border-red-200">
                    <CardContent className="p-4">
                      <Eye className="h-6 w-6 text-red-600 mb-2" />
                      <h4 className="font-medium text-red-900">Accès non contrôlés</h4>
                      <p className="text-sm text-red-700 mt-1">Droits excessifs, comptes non révoqués</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Protection des données - visible si étape correspondante */}
            {(!visibleSections || isSectionVisible("module3-classification")) && (
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Protéger les données sensibles
                </h3>

                <div className="mb-4">
                  <h4 className="font-medium text-blue-800 mb-3">🏷️ Classification des données</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-red-100 border border-red-300 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-900">Confidentiel</span>
                      </div>
                      <p className="text-xs text-red-700">Données personnelles, stratégiques, financières</p>
                    </div>
                    <div className="bg-yellow-100 border border-yellow-300 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-900">Interne</span>
                      </div>
                      <p className="text-xs text-yellow-700">Procédures, organigrammes, projets en cours</p>
                    </div>
                    <div className="bg-green-100 border border-green-300 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-900">Public</span>
                      </div>
                      <p className="text-xs text-green-700">Site web, plaquettes commerciales</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">🔐 Techniques de protection</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Chiffrement des données sensibles</li>
                      <li>• Anonymisation/pseudonymisation</li>
                      <li>• Contrôle d'accès basé sur les rôles</li>
                      <li>• Audit et traçabilité</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">📋 Conformité RGPD</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Minimisation des données</li>
                      <li>• Consentement explicite</li>
                      <li>• Droit à l'effacement</li>
                      <li>• Notification des violations</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ateliers pratiques - visible seulement si étape ateliers est visible */}
      {(!visibleSections || isSectionVisible("module3-ateliers")) && (
        <>
          {/* Workshops */}
          {currentWorkshop === "internal" && (
            <InternalRisksWorkshop
              onComplete={(details) => {
                onComplete?.({
                  ...details,
                  completed: false,
                  timestamp: Date.now(),
                })
                setCurrentWorkshop("classification")
              }}
            />
          )}

          {currentWorkshop === "classification" && (
            <ClassificationWorkshop
              onComplete={(details) => {
                onComplete?.({
                  ...details,
                  completed: true,
                  timestamp: Date.now(),
                })
                onNext()
              }}
            />
          )}

          {!currentWorkshop && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-orange-600" />
                  Ateliers pratiques
                </CardTitle>
                <CardDescription>Mettez en pratique vos connaissances</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setCurrentWorkshop("internal")} className="flex items-center gap-2">
                  Commencer les ateliers pratiques
                  <Brain className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

// Internal Risks Workshop Component
function InternalRisksWorkshop({ onComplete }: { onComplete: (details?: { score?: number; total?: number; activity?: string; type?: "quiz" | "atelier" }) => void }) {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [reported, setReported] = useState(false)

  const scenarios = [
    {
      situation:
        "Marie quitte le bureau pour déjeuner sans verrouiller son ordinateur. Ses collègues peuvent voir sa messagerie ouverte avec des emails confidentiels.",
      risks: ["Accès non autorisé aux emails", "Possible vol de données", "Usurpation d'identité"],
      correctAction: "lock",
      options: [
        { id: "ignore", label: "Ignorer", icon: "👁️" },
        { id: "lock", label: "Verrouiller l'ordinateur", icon: "🔒" },
        { id: "report", label: "Signaler à Marie", icon: "💬" },
      ],
    },
    {
      situation:
        "Thomas partage son mot de passe avec un collègue pour qu'il puisse accéder à un fichier urgent en son absence.",
      risks: ["Perte de traçabilité", "Responsabilité partagée", "Violation de politique"],
      correctAction: "alternative",
      options: [
        { id: "accept", label: "Accepter exceptionnellement", icon: "✅" },
        { id: "refuse", label: "Refuser catégoriquement", icon: "❌" },
        { id: "alternative", label: "Proposer une alternative sécurisée", icon: "🔄" },
      ],
    },
    {
      situation:
        "Julie reçoit un email d'un 'collègue' demandant les coordonnées bancaires d'un client pour un remboursement urgent.",
      risks: ["Phishing interne", "Vol de données client", "Fraude financière"],
      correctAction: "verify",
      options: [
        { id: "send", label: "Envoyer les coordonnées", icon: "📤" },
        { id: "verify", label: "Vérifier auprès du collègue", icon: "📞" },
        { id: "refuse", label: "Refuser sans vérification", icon: "🚫" },
      ],
    },
  ]

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers]
    newAnswers[currentScenario] = answer
    setAnswers(newAnswers)

    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1)
    } else {
      setShowResults(true)
    }
  }

  const score = answers.reduce((acc, answer, index) => {
    return acc + (answer === scenarios[index].correctAction ? 1 : 0)
  }, 0)

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-red-600" />🎯 Atelier : Identifier les risques internes
        </CardTitle>
        <CardDescription>Analysez ces situations et choisissez la meilleure réaction</CardDescription>
      </CardHeader>
      <CardContent>
        {!showResults ? (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">
                  Situation {currentScenario + 1}/{scenarios.length}
                </span>
                <Badge variant="outline">{currentScenario + 1}/3</Badge>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm">{scenarios[currentScenario].situation}</p>
                </div>

                <div>
                  <h4 className="font-medium text-red-900 mb-2">⚠️ Risques identifiés :</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {scenarios[currentScenario].risks.map((risk, index) => (
                      <li key={index}>• {risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {scenarios[currentScenario].options.map((option) => (
                <Button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  variant="outline"
                  className="flex items-center gap-3 h-auto p-4 justify-start"
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Résultats : {score}/{scenarios.length} bonnes réponses
              </h3>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  score === scenarios.length
                    ? "bg-green-100 text-green-800"
                    : score >= scenarios.length / 2
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {score === scenarios.length
                  ? "🎉 Excellent !"
                  : score >= scenarios.length / 2
                    ? "👍 Bien !"
                    : "⚠️ À améliorer"}
              </div>
            </div>

            <div className="space-y-4">
              {scenarios.map((scenario, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">Situation {index + 1}</span>
                      <Badge variant={answers[index] === scenario.correctAction ? "default" : "destructive"}>
                        {answers[index] === scenario.correctAction ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{scenario.situation}</p>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium text-red-600">Bonne réponse : </span>
                      {scenario.options.find((opt) => opt.id === scenario.correctAction)?.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={() => {
                if (reported) return
                setReported(true)
                onComplete?.({
                  score,
                  total: scenarios.length,
                  activity: "Atelier risques internes",
                  type: "atelier",
                })
              }}
              className="w-full"
            >
              Enregistrer le score et continuer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Classification Workshop Component
function ClassificationWorkshop({ onComplete }: { onComplete: (details?: { score?: number; total?: number; activity?: string; type?: "quiz" | "atelier" }) => void }) {
  const [currentItem, setCurrentItem] = useState(0)
  const [classifications, setClassifications] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [reported, setReported] = useState(false)

  const dataItems = [
    {
      name: "Numéros de carte bancaire clients",
      description: "Base de données contenant les informations de paiement des clients",
      correctClass: "confidentiel",
      reasoning: "Données personnelles sensibles, réglementées par le RGPD",
    },
    {
      name: "Organigramme de l'entreprise",
      description: "Structure hiérarchique et contacts internes de l'organisation",
      correctClass: "interne",
      reasoning: "Information interne mais pas critique pour la sécurité",
    },
    {
      name: "Plaquette commerciale",
      description: "Document de présentation des produits et services",
      correctClass: "public",
      reasoning: "Destiné à être partagé avec clients et prospects",
    },
    {
      name: "Stratégie d'acquisition 2024",
      description: "Plan stratégique détaillant les futurs rachats d'entreprises",
      correctClass: "confidentiel",
      reasoning: "Information stratégique critique pour l'entreprise",
    },
    {
      name: "Procédure de sauvegarde IT",
      description: "Documentation technique des processus de sauvegarde",
      correctClass: "interne",
      reasoning: "Information technique interne, pas publique mais pas critique",
    },
  ]

  const handleClassification = (classification: string) => {
    const newClassifications = [...classifications]
    newClassifications[currentItem] = classification
    setClassifications(newClassifications)

    if (currentItem < dataItems.length - 1) {
      setCurrentItem(currentItem + 1)
    } else {
      setShowResults(true)
    }
  }

  const score = classifications.reduce((acc, classification, index) => {
    return acc + (classification === dataItems[index].correctClass ? 1 : 0)
  }, 0)

  const getClassColor = (className: string) => {
    switch (className) {
      case "confidentiel":
        return "bg-red-100 border-red-300 text-red-800"
      case "interne":
        return "bg-yellow-100 border-yellow-300 text-yellow-800"
      case "public":
        return "bg-green-100 border-green-300 text-green-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />🎯 Atelier : Classer des informations sensibles
        </CardTitle>
        <CardDescription>Déterminez le niveau de classification approprié pour chaque élément</CardDescription>
      </CardHeader>
      <CardContent>
        {!showResults ? (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">
                  Élément {currentItem + 1}/{dataItems.length}
                </span>
                <Badge variant="outline">{currentItem + 1}/5</Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">{dataItems[currentItem].name}</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{dataItems[currentItem].description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Choisissez le niveau de classification :</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      onClick={() => handleClassification("confidentiel")}
                      variant="outline"
                      className="flex items-center gap-3 h-auto p-4 justify-start border-red-300 hover:bg-red-50"
                    >
                      <Lock className="h-5 w-5 text-red-600" />
                      <div className="text-left">
                        <div className="font-medium text-red-900">Confidentiel</div>
                        <div className="text-xs text-red-700">Données sensibles, accès restreint</div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => handleClassification("interne")}
                      variant="outline"
                      className="flex items-center gap-3 h-auto p-4 justify-start border-yellow-300 hover:bg-yellow-50"
                    >
                      <Building className="h-5 w-5 text-yellow-600" />
                      <div className="text-left">
                        <div className="font-medium text-yellow-900">Interne</div>
                        <div className="text-xs text-yellow-700">Usage interne uniquement</div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => handleClassification("public")}
                      variant="outline"
                      className="flex items-center gap-3 h-auto p-4 justify-start border-green-300 hover:bg-green-50"
                    >
                      <Globe className="h-5 w-5 text-green-600" />
                      <div className="text-left">
                        <div className="font-medium text-green-900">Public</div>
                        <div className="text-xs text-green-700">Peut être partagé librement</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Résultats : {score}/{dataItems.length} bonnes classifications
              </h3>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  score === dataItems.length
                    ? "bg-green-100 text-green-800"
                    : score >= dataItems.length * 0.7
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {score === dataItems.length
                  ? "🎉 Parfait !"
                  : score >= dataItems.length * 0.7
                    ? "👍 Bien joué !"
                    : "⚠️ À revoir"}
              </div>
            </div>

            <div className="space-y-4">
              {dataItems.map((item, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{item.name}</span>
                      <Badge variant={classifications[index] === item.correctClass ? "default" : "destructive"}>
                        {classifications[index] === item.correctClass ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500">Votre choix :</span>
                      <span className={`text-xs px-2 py-1 rounded ${getClassColor(classifications[index])}`}>
                        {classifications[index]}
                      </span>
                      <span className="text-xs text-gray-500">→ Correct :</span>
                      <span className={`text-xs px-2 py-1 rounded ${getClassColor(item.correctClass)}`}>
                        {item.correctClass}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Justification : </span>
                      {item.reasoning}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={() => {
                if (reported) return
                setReported(true)
                onComplete?.({
                  score,
                  total: dataItems.length,
                  activity: "Atelier classification des données",
                  type: "atelier",
                })
              }}
              className="w-full"
            >
              Enregistrer le score et continuer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
