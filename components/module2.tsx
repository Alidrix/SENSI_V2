"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lock, Brain, CheckCircle, AlertTriangle, Eye, EyeOff, RefreshCw, Mail, Shield } from "lucide-react"

export function Module2({
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
      {(!visibleSections || isSectionVisible("module2-intro")) && (
        <Card>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-6 text-left">
              <CardTitle className="flex items-center gap-2 text-black">
                <span aria-hidden="true">🧭</span>
                <span>Repères essentiels</span>
              </CardTitle>
              <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Réflexes essentiels
                </h3>
                <p className="text-sm text-purple-800">
                  Cette section se concentre désormais sur les messages clés à retenir avant de passer aux ateliers
                  pratiques. Gardez ces priorités en tête pour réduire rapidement vos risques.
                </p>
                <ul className="mt-3 text-sm text-purple-800 space-y-1">
                  <li>• Vérifier systématiquement l'origine des demandes sensibles</li>
                  <li>• Limiter les accès et données partagées au strict nécessaire</li>
                  <li>• Sauvegarder et mettre à jour régulièrement ses outils</li>
                </ul>
              </div>

              <div className="bg-white border border-purple-200 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Passez directement à la pratique</h4>
                <p className="text-sm text-purple-800">
                  Les ateliers interactifs qui suivent vous guideront pas à pas. Vous pouvez y accéder dès maintenant
                  pour mettre en œuvre ces réflexes en situation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ateliers pratiques - visible seulement si étape ateliers est visible */}
      {(!visibleSections || isSectionVisible("module2-ateliers")) && (
        <>
          {/* Workshops */}
          {currentWorkshop === "password" && <PasswordWorkshop onComplete={() => setCurrentWorkshop("email")} />}

          {currentWorkshop === "email" && (
            <EmailWorkshop
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
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  Ateliers pratiques
                </CardTitle>
                <CardDescription>Mettez en pratique vos connaissances</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setCurrentWorkshop("password")} className="flex items-center gap-2">
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

// Password Workshop Component
function PasswordWorkshop({ onComplete }: { onComplete: (details?: { score?: number; total?: number }) => void }) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const analyzePassword = (pwd: string) => {
    const checks = {
      length: pwd.length >= 12,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /[0-9]/.test(pwd),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      common: !["password", "123456", "azerty", "motdepasse"].some((common) => pwd.toLowerCase().includes(common)),
    }

    const score = Object.values(checks).filter(Boolean).length
    const strength = score <= 2 ? "Faible" : score <= 4 ? "Moyen" : "Fort"
    const color = score <= 2 ? "red" : score <= 4 ? "yellow" : "green"

    return { checks, score, strength, color, percentage: (score / 6) * 100 }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (value.length > 0) {
      setAnalysis(analyzePassword(value))
    } else {
      setAnalysis(null)
    }
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let result = ""
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    handlePasswordChange(result)
  }

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-6 w-6 text-purple-600" />🎯 Atelier : Création d'un mot de passe sécurisé
        </CardTitle>
        <CardDescription>Testez la robustesse de vos mots de passe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Tapez votre mot de passe..."
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={generatePassword}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {analysis && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Force du mot de passe</span>
                  <Badge variant={analysis.color === "green" ? "default" : "destructive"}>{analysis.strength}</Badge>
                </div>
                <Progress value={analysis.percentage} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(analysis.checks).map(([key, passed]) => {
                  const labels = {
                    length: "Au moins 12 caractères",
                    uppercase: "Majuscules (A-Z)",
                    lowercase: "Minuscules (a-z)",
                    numbers: "Chiffres (0-9)",
                    symbols: "Symboles (!@#$...)",
                    common: "Pas de mots courants",
                  }

                  return (
                    <div key={key} className="flex items-center gap-2">
                      {passed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${passed ? "text-green-700" : "text-red-700"}`}>
                        {labels[key as keyof typeof labels]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium mb-2">💡 Conseils pour un mot de passe fort</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Utilisez une phrase de passe : "J'aime les croissants du matin à 8h30!"</li>
            <li>• Combinez des mots sans rapport : "Baleine-Ordinateur-Rouge-2024"</li>
            <li>• Utilisez un gestionnaire de mots de passe</li>
            <li>• Activez l'authentification à deux facteurs</li>
          </ul>
        </div>

        <Button onClick={() => onComplete?.()} className="w-full">
          Continuer vers l'atelier emails
        </Button>
      </CardContent>
    </Card>
  )
}

// Email Workshop Component
function EmailWorkshop({
  onComplete,
}: {
  onComplete: (details?: { score?: number; total?: number; activity?: string; type?: "quiz" | "atelier" }) => void
}) {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [responses, setResponses] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [reported, setReported] = useState(false)

  const scenarios = [
    {
      subject: "RE: Facture en attente",
      from: "comptabilite@fournisseur-xyz.com",
      content:
        "Bonjour, suite à notre échange téléphonique, voici la facture demandée. Merci de procéder au règlement dans les meilleurs délais.",
      attachment: "facture_mars_2024.pdf",
      suspicious: false,
      redFlags: [],
      goodSigns: ["Expéditeur connu", "Contexte cohérent", "Pas d'urgence artificielle"],
    },
    {
      subject: "URGENT - Votre commande Amazon sera annulée",
      from: "no-reply@amazon-secure.net",
      content:
        "Votre commande #AMZ123456 sera annulée dans 24h si vous ne confirmez pas vos informations de paiement. Cliquez ici immédiatement.",
      attachment: null,
      suspicious: true,
      redFlags: ["Urgence artificielle", "Faux domaine", "Demande d'informations sensibles"],
      goodSigns: [],
    },
    {
      subject: "Invitation réunion équipe - Vendredi 15h",
      from: "claire.martin@entreprise.com",
      content:
        "Bonjour à tous, je vous invite à notre réunion hebdomadaire vendredi à 15h en salle de conférence. À bientôt !",
      attachment: null,
      suspicious: false,
      redFlags: [],
      goodSigns: ["Expéditeur interne", "Contenu professionnel", "Pas de liens suspects"],
    },
  ]

  const handleResponse = (action: string) => {
    const newResponses = [...responses]
    newResponses[currentScenario] = action
    setResponses(newResponses)

    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1)
    } else {
      setShowResults(true)
    }
  }

  const getCorrectAction = (scenario: any) => {
    return scenario.suspicious ? "report" : "trust"
  }

  const score = responses.reduce((acc, response, index) => {
    return acc + (response === getCorrectAction(scenarios[index]) ? 1 : 0)
  }, 0)

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-green-600" />🎯 Atelier : Détecter des emails suspects
        </CardTitle>
        <CardDescription>Analysez ces emails et choisissez la bonne réaction</CardDescription>
      </CardHeader>
      <CardContent>
        {!showResults ? (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">
                  Scenario {currentScenario + 1}/{scenarios.length}
                </span>
                <Badge variant="outline">{currentScenario + 1}/3</Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">De : </span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {scenarios[currentScenario].from}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Objet : </span>
                  <span className="text-sm">{scenarios[currentScenario].subject}</span>
                </div>
                {scenarios[currentScenario].attachment && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Pièce jointe : </span>
                    <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                      📎 {scenarios[currentScenario].attachment}
                    </span>
                  </div>
                )}
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm">{scenarios[currentScenario].content}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => handleResponse("trust")}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto p-4"
              >
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-sm">Email légitime</span>
                <span className="text-xs text-gray-500">Traiter normalement</span>
              </Button>
              <Button
                onClick={() => handleResponse("verify")}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto p-4"
              >
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <span className="text-sm">Vérifier</span>
                <span className="text-xs text-gray-500">Contacter l'expéditeur</span>
              </Button>
              <Button
                onClick={() => handleResponse("report")}
                variant="destructive"
                className="flex flex-col items-center gap-2 h-auto p-4"
              >
                <Shield className="h-6 w-6" />
                <span className="text-sm">Signaler</span>
                <span className="text-xs text-white/80">Email suspect</span>
              </Button>
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
                  ? "🎉 Parfait !"
                  : score >= scenarios.length / 2
                    ? "👍 Bien joué !"
                    : "⚠️ À améliorer"}
              </div>
            </div>

            <div className="space-y-4">
              {scenarios.map((scenario, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {scenario.suspicious ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-medium">{scenario.suspicious ? "EMAIL SUSPECT" : "EMAIL LÉGITIME"}</span>
                      </div>
                      <Badge variant={responses[index] === getCorrectAction(scenario) ? "default" : "destructive"}>
                        {responses[index] === getCorrectAction(scenario) ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{scenario.subject}</p>
                    <div className="text-xs text-gray-500">
                      {scenario.suspicious ? (
                        <>
                          <span className="font-medium text-red-600">Signaux d'alarme : </span>
                          {scenario.redFlags.join(", ")}
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-green-600">Signaux positifs : </span>
                          {scenario.goodSigns.join(", ")}
                        </>
                      )}
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
                  activity: "Atelier emails suspects",
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
