"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Shield, Phone, FileText, Brain, CheckCircle, Users, Wifi, HardDrive, Mail } from "lucide-react"

export function Module4({
  onComplete,
  onNext,
  currentStep,
  visibleSections,
}: {
  onComplete: () => void
  onNext: () => void
  currentStep?: number
  visibleSections?: string[]
}) {
  const [showIncidentWorkshop, setShowIncidentWorkshop] = useState(false)

  // Vérifier si une section est visible
  const isSectionVisible = (sectionId: string) => {
    return visibleSections?.includes(sectionId) ?? true
  }

  return (
    <div className="space-y-6">
      {/* Contenu principal du module */}
      {(!visibleSections ||
        isSectionVisible("module4-intro") ||
        isSectionVisible("module4-detection") ||
        isSectionVisible("module4-reaction")) && (
        <Card>
          <CardContent className="space-y-6 pt-4">
            <CardTitle className="flex items-center gap-2 text-black">
              <span aria-hidden="true">🛡️</span>
              <span>Points clés de vigilance</span>
            </CardTitle>
            {/* Reconnaître un incident - visible si étape correspondante */}
            {(!visibleSections || isSectionVisible("module4-detection")) && (
              <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Comment reconnaître un incident ?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-orange-800 mb-3">🚨 Signaux d'alerte</h4>
                    <ul className="text-sm text-orange-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Ralentissement anormal du système</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Messages d'erreur inhabituels</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Fichiers cryptés ou inaccessibles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Activité réseau suspecte</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Comptes bloqués ou compromis</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-800 mb-3">🎯 Types d'incidents</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Wifi className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-900 text-sm">Intrusion</span>
                        </div>
                        <p className="text-xs text-orange-700">Accès non autorisé aux systèmes</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                          <HardDrive className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-900 text-sm">Malware</span>
                        </div>
                        <p className="text-xs text-orange-700">Virus, ransomware, spyware</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-900 text-sm">Fuite de données</span>
                        </div>
                        <p className="text-xs text-orange-700">Vol ou exposition d'informations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Plan de réaction - visible si étape correspondante */}
            {(!visibleSections || isSectionVisible("module4-reaction")) && (
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Plan de réaction aux incidents
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            1
                          </div>
                          <span className="font-medium text-blue-900 text-sm">Isoler</span>
                        </div>
                        <p className="text-xs text-blue-700">Déconnecter l'appareil du réseau</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            2
                          </div>
                          <span className="font-medium text-blue-900 text-sm">Alerter</span>
                        </div>
                        <p className="text-xs text-blue-700">Prévenir l'équipe IT/sécurité</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            3
                          </div>
                          <span className="font-medium text-blue-900 text-sm">Documenter</span>
                        </div>
                        <p className="text-xs text-blue-700">Noter les détails de l'incident</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            4
                          </div>
                          <span className="font-medium text-blue-900 text-sm">Suivre</span>
                        </div>
                        <p className="text-xs text-blue-700">Appliquer les instructions reçues</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-white p-4 rounded border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Qui prévenir ?
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-sm rounded-md border border-blue-100 bg-blue-50 p-3">
                        <span className="font-medium text-blue-900">INTERNE</span>
                        <ul className="text-blue-700 mt-2 space-y-1">
                          <li>• Équipe IT/sécurité</li>
                          <li>• Manager direct</li>
                          <li>• RSSI/DPO</li>
                          <li>• Direction</li>
                        </ul>
                      </div>
                      <div className="text-sm rounded-md border border-blue-100 bg-blue-50 p-3">
                        <span className="font-medium text-blue-900">EXTERNE</span>
                        <ul className="text-blue-700 mt-2 space-y-1">
                          <li>• ANSSI</li>
                          <li>• Police</li>
                          <li>• CNIL</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Atelier simulation - visible seulement si étape atelier est visible */}
      {(!visibleSections || isSectionVisible("module4-atelier")) && !showIncidentWorkshop && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-red-600" />
              Atelier simulation
            </CardTitle>
            <CardDescription>Simulez votre réaction face à des incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowIncidentWorkshop(true)} className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Atelier : Simuler des incidents
            </Button>
          </CardContent>
        </Card>
      )}

      {showIncidentWorkshop && (
        <IncidentWorkshop
          onComplete={() => {
            onComplete()
            onNext()
          }}
        />
      )}
    </div>
  )
}

// Incident Response Workshop Component
function IncidentWorkshop({ onComplete }: { onComplete: () => void }) {
  const [currentIncident, setCurrentIncident] = useState(0)
  const [responses, setResponses] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  const getUniqueActions = (actions: { action: string; correct: boolean }[]) => {
    return actions.filter(
      (action, index, self) => self.findIndex((item) => item.action === action.action) === index,
    )
  }

  const incidents = [
    {
      type: "Phishing détecté",
      icon: <Mail className="h-6 w-6 text-red-500" />,
      scenario:
        "Vous recevez un email suspect demandant vos identifiants. Vous réalisez que c'est un phishing après avoir failli cliquer.",
      immediateActions: [
        { action: "Ne pas cliquer sur les liens", correct: true },
        { action: "Signaler l'email à l'IT", correct: true },
        { action: "Supprimer l'email", correct: false },
        { action: "Changer ses mots de passe", correct: false },
      ],
      correctResponse:
        "Signaler immédiatement à l'équipe IT sans supprimer l'email (preuve), ne pas cliquer sur les liens",
    },
    {
      type: "Ransomware détecté",
      icon: <HardDrive className="h-6 w-6 text-red-500" />,
      scenario: "Votre ordinateur affiche un message indiquant que vos fichiers sont cryptés et demande une rançon.",
      immediateActions: [
        { action: "Déconnecter du réseau", correct: true },
        { action: "Éteindre l'ordinateur", correct: false },
        { action: "Ne jamais payer la rançon", correct: true },
        { action: "Éteindre l'ordinateur", correct: true },
        { action: "Ne jamais payer la rançon", correct: true },
        { action: "Ne jamais payer la rançon", correct: false },
        { action: "Alerter immédiatement l'IT", correct: true },
      ],
      correctResponse: "Déconnecter immédiatement la machine du réseau, alerter l'IT, ne jamais payer la rançon",
    },
    {
      type: "Compte compromis",
      icon: <Users className="h-6 w-6 text-red-500" />,
      scenario:
        "Vous recevez des notifications d'activité suspecte sur votre compte professionnel (connexions inhabituelles).",
      immediateActions: [
        { action: "Changer le mot de passe", correct: true },
        { action: "Vérifier les accès récents", correct: false },
        { action: "Signaler à l'équipe sécurité", correct: true },
        { action: "Activer 2FA", correct: true },
      ],
      correctResponse: "Changer immédiatement le mot de passe, activer la 2FA, signaler l'incident",
    },
  ]

  const handleResponse = (selectedActions: string[]) => {
    const newResponses = [...responses]
    newResponses[currentIncident] = selectedActions
    setResponses(newResponses)

    if (currentIncident < incidents.length - 1) {
      setCurrentIncident(currentIncident + 1)
    } else {
      setShowResults(true)
    }
  }

  const [selectedActions, setSelectedActions] = useState<string[]>([])

  const calculateScore = () => {
    return responses.reduce((totalScore, incidentResponse, incidentIndex) => {
      const incident = incidents[incidentIndex]
      const uniqueActions = getUniqueActions(incident.immediateActions)
      const correctActions = uniqueActions.filter((action) => action.correct).length
      const selectedCorrect = incidentResponse.filter(
        (action: string) => uniqueActions.find((a) => a.action === action)?.correct,
      ).length
      const selectedWrong = incidentResponse.filter(
        (action: string) => uniqueActions.find((a) => a.action === action)?.correct === false,
      ).length

      if (selectedCorrect === correctActions && selectedWrong === 0) {
        return totalScore + 1
      }

      const incidentScore = Math.max(0, selectedCorrect - selectedWrong * 0.5)
      return totalScore + incidentScore / correctActions
    }, 0)
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />🎯 Atelier : Réagir aux incidents
        </CardTitle>
        <CardDescription>Simulez votre réaction face à différents types d'incidents</CardDescription>
      </CardHeader>
      <CardContent>
        {!showResults ? (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {incidents[currentIncident].icon}
                  <div>
                    <span className="font-medium">{incidents[currentIncident].type}</span>
                    <div className="text-sm text-gray-500">
                      Incident {currentIncident + 1}/{incidents.length}
                    </div>
                  </div>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 p-4 rounded">
                  <h4 className="font-medium text-red-900 mb-2">🚨 Situation</h4>
                  <p className="text-sm text-red-800">{incidents[currentIncident].scenario}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Sélectionnez les actions à entreprendre immédiatement :</h4>
                  <div className="space-y-2">
                    {getUniqueActions(incidents[currentIncident].immediateActions).map((action, index) => {
                      const isSelected = selectedActions.includes(action.action)

                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className={`w-full justify-start h-auto p-3 ${
                            isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                          } border-gray-200 bg-white`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedActions(selectedActions.filter((a) => a !== action.action))
                            } else {
                              setSelectedActions([...selectedActions, action.action])
                            }
                          }}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div
                              className={`w-4 h-4 rounded border-2 ${
                                isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                              }`}
                            >
                              {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm">{action.action}</div>
                            </div>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedActions([])} disabled={selectedActions.length === 0}>
                Réinitialiser
              </Button>
              <Button onClick={() => handleResponse(selectedActions)} disabled={selectedActions.length === 0}>
                {currentIncident === incidents.length - 1 ? "Terminer" : "Suivant"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Score global : {Math.round((calculateScore() * 100) / incidents.length)}%
              </h3>
              <Progress value={(calculateScore() * 100) / incidents.length} className="h-3 mb-2" />
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  calculateScore() / incidents.length > 0.8
                    ? "bg-green-100 text-green-800"
                    : calculateScore() / incidents.length > 0.6
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {calculateScore() / incidents.length > 0.8
                  ? "🎉 Excellent réflexe !"
                  : calculateScore() / incidents.length > 0.6
                    ? "👍 Bonne réaction !"
                    : "⚠️ À améliorer"}
              </div>
            </div>

            <div className="space-y-4">
              {incidents.map((incident, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {incident.icon}
                      <span className="font-medium">{incident.type}</span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-green-600">Actions correctes sélectionnées :</span>
                        <div className="text-sm text-gray-600">
                          {responses[index]
                            .filter(
                              (action: string) => incident.immediateActions.find((a) => a.action === action)?.correct,
                            )
                            .join(", ") || "Aucune"}
                        </div>
                      </div>

                      {responses[index].some(
                        (action: string) =>
                          incident.immediateActions.find((a) => a.action === action)?.correct === false,
                      ) && (
                        <div>
                          <span className="text-sm font-medium text-red-600">Actions incorrectes sélectionnées :</span>
                          <div className="text-sm text-gray-600">
                            {responses[index]
                              .filter(
                                (action: string) =>
                                  incident.immediateActions.find((a) => a.action === action)?.correct === false,
                              )
                              .join(", ")}
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-xs font-medium text-gray-700">Réponse recommandée : </span>
                        <span className="text-xs text-gray-600">{incident.correctResponse}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  )
}
