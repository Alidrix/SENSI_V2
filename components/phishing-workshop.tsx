"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, AlertTriangle, CheckCircle, Brain } from "lucide-react"

export function PhishingWorkshop({ onProgress }: { onProgress?: (progress: any) => void }) {
  const [currentEmail, setCurrentEmail] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [showResults, setShowResults] = useState(false)
  const [startTime] = useState(Date.now())

  const emails = [
    {
      subject: "🚨 Action urgente requise - Votre compte sera suspendu",
      from: "securite@banque-populaire.com",
      content:
        "Cher client, nous avons detecté une activité suspecte sur votre compte. Cliquez immédiatement sur ce lien pour vérifier votre identité : http://bit.ly/verify-account",
      isPhishing: true,
      indicators: [
        "Urgence artificielle",
        "Fautes d'orthographe ('detecté')",
        "Lien raccourci suspect",
        "Faux expéditeur",
        "Demande d'action immédiate",
      ],
      explanation:
        "Email de phishing classique utilisant l'urgence et l'usurpation d'identité pour pousser à l'action.",
    },
    {
      subject: "Rapport mensuel - Équipe Marketing",
      from: "marie.dupont@entreprise.com",
      content:
        "Bonjour, veuillez trouver en pièce jointe le rapport mensuel de notre équipe. N'hésitez pas si vous avez des questions. Cordialement, Marie",
      isPhishing: false,
      indicators: ["Expéditeur connu", "Pas d'urgence", "Contenu professionnel normal", "Ton approprié"],
      explanation: "Email professionnel légitime avec un contenu et un expéditeur cohérents.",
    },
    {
      subject: "Félicitations ! Vous avez gagné 1000€",
      from: "concours@amazon-promo.net",
      content:
        "Félicitations ! Vous êtes notre grand gagnant du mois. Réclamez votre prix de 1000€ en cliquant ici avant minuit. Offre limitée !",
      isPhishing: true,
      indicators: [
        "Promesse de gain non sollicitée",
        "Faux domaine Amazon",
        "Urgence artificielle",
        "Trop beau pour être vrai",
      ],
      explanation: "Arnaque classique par appât du gain avec faux domaine et urgence artificielle.",
    },
    {
      subject: "Mise à jour de sécurité - Votre mot de passe expire",
      from: "it-support@votre-entreprise.com",
      content:
        "Votre mot de passe expire dans 24h. Cliquez sur ce lien pour le renouveler : https://password-update-secure.com/login",
      isPhishing: true,
      indicators: ["Domaine externe suspect", "Demande de mot de passe", "Urgence (24h)", "Lien vers site externe"],
      explanation: "Tentative de vol de mots de passe en imitant le support IT interne.",
    },
  ]

  const handleAnswer = (isPhishing: boolean) => {
    const newAnswers = [...answers]
    newAnswers[currentEmail] = isPhishing === emails[currentEmail].isPhishing
    setAnswers(newAnswers)

    if (currentEmail < emails.length - 1) {
      setCurrentEmail(currentEmail + 1)
    } else {
      const endTime = Date.now()
      const duration = endTime - startTime
      const score = newAnswers.filter(Boolean).length

      setShowResults(true)

      // Sauvegarder la progression
      if (onProgress) {
        onProgress({
          score,
          total: emails.length,
          duration,
          answers: newAnswers,
          completed: true,
          timestamp: endTime,
        })
      }
    }
  }

  const score = answers.filter(Boolean).length
  const percentage = Math.round((score / emails.length) * 100)

  return (
    <Card className="border-yellow-200 bg-yellow-50 animate-in slide-in-from-bottom-4 duration-500 scroll-mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-yellow-600" />🎯 Atelier Pratique : Identifier un phishing
        </CardTitle>
        <CardDescription>Analysez ces emails et déterminez s'ils sont légitimes ou frauduleux</CardDescription>
      </CardHeader>
      <CardContent>
        {!showResults ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email {currentEmail + 1}/{emails.length}
              </Badge>
              <div className="text-sm text-gray-500">
                Progression : {Math.round(((currentEmail + 1) / emails.length) * 100)}%
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">De :</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{emails[currentEmail].from}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Objet :</span>
                    <span className="text-sm font-medium">{emails[currentEmail].subject}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded border-l-4 border-gray-300">
                  <p className="text-sm leading-relaxed">{emails[currentEmail].content}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🔍 Points à analyser</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• L'expéditeur est-il légitime ?</li>
                <li>• Le contenu est-il cohérent ?</li>
                <li>• Y a-t-il une urgence artificielle ?</li>
                <li>• Les liens semblent-ils suspects ?</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => handleAnswer(false)}
                variant="outline"
                className="flex items-center gap-2 px-6 py-3"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 text-green-600" />
                Email légitime
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                variant="destructive"
                className="flex items-center gap-2 px-6 py-3"
                size="lg"
              >
                <AlertTriangle className="h-5 w-5" />
                Email frauduleux (phishing)
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                    percentage >= 75
                      ? "bg-green-100 text-green-600"
                      : percentage >= 50
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                  }`}
                >
                  <span className="text-2xl font-bold">{percentage}%</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Score : {score}/{emails.length} bonnes réponses
                </h3>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                    percentage >= 75
                      ? "bg-green-100 text-green-800"
                      : percentage >= 50
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {percentage >= 75
                    ? "🎉 Excellent ! Vous savez identifier les menaces"
                    : percentage >= 50
                      ? "👍 Bien ! Quelques points à améliorer"
                      : "⚠️ Attention ! Revoyez les indicateurs de phishing"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-center">📋 Analyse détaillée</h4>
              {emails.map((email, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {email.isPhishing ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <span className="font-medium">{email.isPhishing ? "PHISHING DÉTECTÉ" : "EMAIL LÉGITIME"}</span>
                      </div>
                      <Badge variant={answers[index] === email.isPhishing ? "default" : "destructive"}>
                        {answers[index] === email.isPhishing ? "✓ Correct" : "✗ Incorrect"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 font-medium">{email.subject}</p>
                    <p className="text-sm text-gray-700 mb-3">{email.explanation}</p>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs font-medium text-gray-700 mb-1">Indicateurs clés :</div>
                      <div className="flex flex-wrap gap-1">
                        {email.indicators.map((indicator, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className={`text-xs ${
                              email.isPhishing ? "border-red-300 text-red-700" : "border-green-300 text-green-700"
                            }`}
                          >
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Points clés à retenir</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Toujours vérifier l'expéditeur et le domaine</li>
                <li>• Se méfier de l'urgence artificielle</li>
                <li>• Ne jamais cliquer sur des liens suspects</li>
                <li>• En cas de doute, contacter directement l'expéditeur</li>
                <li>• Signaler les emails suspects au service IT</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
