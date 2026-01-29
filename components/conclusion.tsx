"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Trophy, BookOpen, Brain, Star, Download, Globe, Phone } from "lucide-react"

export function ConclusionModule({
  onComplete,
  currentStep,
  visibleSections,
  onQuizComplete,
}: {
  onComplete: () => void
  currentStep?: number
  visibleSections?: string[]
  onQuizComplete?: (score: number, total: number) => void
}) {
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showQuizResults, setShowQuizResults] = useState(false)

  // Vérifier si une section est visible
  const isSectionVisible = (sectionId: string) => {
    return visibleSections?.includes(sectionId) ?? true
  }

  const quizQuestions = [
    {
      question: "Quelle est la règle principale pour un mot de passe sécurisé ?",
      options: [
        "Au moins 8 caractères avec votre nom",
        "Au moins 12 caractères, unique et complexe",
        "Utiliser toujours le même mot de passe",
        "Noter tous ses mots de passe",
      ],
      correct: 1,
    },
    {
      question: "Face à un email suspect, que devez-vous faire en priorité ?",
      options: [
        "Cliquer pour vérifier",
        "Transférer à vos collègues",
        "Ne pas cliquer et signaler",
        "Supprimer immédiatement",
      ],
      correct: 2,
    },
    {
      question: "En cas d'incident de sécurité, quelle est la première action ?",
      options: [
        "Redémarrer l'ordinateur",
        "Isoler et alerter l'équipe IT",
        "Continuer à travailler normalement",
        "Essayer de résoudre seul",
      ],
      correct: 1,
    },
    {
      question: "Comment classer les numéros de carte bancaire clients ?",
      options: ["Public", "Interne", "Confidentiel", "Peu important"],
      correct: 2,
    },
    {
      question: "Quelle est la meilleure pratique pour les mises à jour ?",
      options: [
        "Les faire manuellement une fois par an",
        "Les éviter car elles causent des bugs",
        "Les installer automatiquement dès disponibles",
        "Attendre que d'autres les testent d'abord",
      ],
      correct: 2,
    },
    {
      question: "Quelle est la solution la plus sûr pour partager un mot de passe ?",
      options: ["SMS", "Gestionnaire de mots de passe", "Email", "Messagerie personnelle"],
      correct: 1,
    },
    {
      question: "Quelle action réduit le risque d'usurpation d'identité ?",
      options: ["Publier moins sur les réseaux", "Utiliser le même pseudo partout", "Désactiver le VPN", "Partager sa date de naissance"],
      correct: 0,
    },
    {
      question: "Que vérifier avant de cliquer sur un lien dans un email ?",
      options: ["La couleur du bouton", "L'URL réelle au survol", "La taille de la police", "Le poids de l'image"],
      correct: 1,
    },
    {
      question: "Quel réflexe je dois adopter en cas de clé USB trouvée ?",
      options: ["La brancher pour identifier le propriétaire", "La donner à la sécurité/IT", "La garder", "La brancher sur un poste isolé"],
      correct: 1,
    },
    {
      question: "Pourquoi utiliser le chiffrement de disque ?",
      options: ["Accélérer l'ordinateur", "Protéger les données en cas de vol", "Partager plus vite", "Installer plus d'applications"],
      correct: 1,
    },
    {
      question: "Que signifie le principe du moindre privilège ?",
      options: ["Donner tous les accès à l'équipe", "Limiter les droits aux besoins réels", "Changer de mot de passe", "Bloquer internet"],
      correct: 1,
    },
    {
      question: "Quel élément peut révéler la présence d'un fichier malveillant ?",
      options: ["Icône réseau grisée", "Fichiers avec extension inconnue", "Ventilateur bruyant", "Ecran en veille"],
      correct: 1,
    },
    {
      question: "Quelle donnée est considérée comme sensible ?",
      options: ["Brevet constructeur industriel", "Menu de la cantine", "Identité d'un client", "Horaires d'ouverture"],
      correct: 2,
    },
    {
      question: "Quel est le meilleur moment pour signaler un incident ?",
      options: ["Après avoir tenté de corriger", "Dès qu'il est suspecté", "En fin de journée", "Jamais"],
      correct: 1,
    },
    {
      question: "Comment sécuriser une connexion Wi-Fi publique ?",
      options: ["Partager la connexion", "Désactiver le pare-feu", "Utiliser un VPN", "Télécharger un antivirus"],
      correct: 2,
    },
  ]

  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowQuizResults(true)
      const finalScore = newAnswers.reduce((score, answer, index) => {
        return score + (answer === quizQuestions[index].correct ? 1 : 0)
      }, 0)
      onQuizComplete?.(finalScore, quizQuestions.length)
    }
  }

  const quizScore = answers.reduce((score, answer, index) => {
    return score + (answer === quizQuestions[index].correct ? 1 : 0)
  }, 0)

  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return { message: "Excellent ! Vous maîtrisez bien les concepts", icon: "🏆", color: "green" }
    if (percentage >= 60) return { message: "Bien joué ! Quelques points à revoir", icon: "👍", color: "yellow" }
    return { message: "Il faut revoir certains concepts", icon: "📚", color: "red" }
  }

  return (
    <div className="space-y-6">
      {/* Points clés - toujours visible ou si section visible */}
      {(!visibleSections || isSectionVisible("conclusion-synthese")) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-emerald-600" />
              Conclusion de la formation
            </CardTitle>
            <CardDescription>Synthèse et ressources pour continuer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Points clés */}
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-lg">
              <h3 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                <Star className="h-5 w-5" />🎯 Points clés à retenir
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-emerald-900">Mots de passe</h4>
                      <p className="text-sm text-emerald-700">Uniques, complexes, gestionnaire recommandé</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-emerald-900">Emails suspects</h4>
                      <p className="text-sm text-emerald-700">Vérifier l'expéditeur, ne pas cliquer, signaler</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-emerald-900">Mises à jour</h4>
                      <p className="text-sm text-emerald-700">Systèmes et logiciels toujours à jour</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-emerald-900">Classification</h4>
                      <p className="text-sm text-emerald-700">Confidentiel, interne, public selon sensibilité</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-emerald-900">Incidents</h4>
                      <p className="text-sm text-emerald-700">Isoler, alerter, documenter, suivre</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-emerald-900">Vigilance</h4>
                      <p className="text-sm text-emerald-700">La sécurité est l'affaire de tous</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions recommandées */}
            <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-4">🚀 Actions à mettre en place dès maintenant</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <span className="text-sm font-medium text-purple-900">
                      Installer un gestionnaire de mots de passe
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <span className="text-sm font-medium text-purple-900">
                      Activer la 2FA sur tous les comptes critiques
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <span className="text-sm font-medium text-purple-900">
                      Vérifier les mises à jour de ses appareils
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <span className="text-sm font-medium text-purple-900">Configurer une sauvegarde automatique</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      5
                    </div>
                    <span className="text-sm font-medium text-purple-900">
                      Sensibiliser ses proches aux bonnes pratiques
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      6
                    </div>
                    <span className="text-sm font-medium text-purple-900">Programmer des formations de rappel</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ressources - visible si section correspondante */}
      {(!visibleSections || isSectionVisible("conclusion-ressources")) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Ressources et bonnes pratiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white border-blue-200">
                <CardContent className="p-4">
                  <Globe className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-medium text-blue-900 mb-2">Sites utiles</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      •{' '}
                      <a
                        href="https://www.ssi.gouv.fr/"
                        className="hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        ANSSI.gouv.fr
                      </a>
                    </li>
                    <li>
                      •{' '}
                      <a
                        href="https://www.cnil.fr/"
                        className="hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        CNIL.fr
                      </a>
                    </li>
                    <li>
                      •{' '}
                      <a
                        href="https://haveibeenpwned.com/"
                        className="hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        HaveIBeenPwned.com
                      </a>
                    </li>
                    <li>
                      •{' '}
                      <a
                        href="https://www.virustotal.com/"
                        className="hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        VirusTotal.com
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white border-blue-200">
                <CardContent className="p-4">
                  <Download className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-medium text-blue-900 mb-2">Outils recommandés</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Gestionnaires de mots de passe</li>
                    <li>• Authentification 2FA</li>
                    <li>• VPN d'entreprise</li>
                    <li>• Antivirus à jour</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white border-blue-200">
                <CardContent className="p-4">
                  <Phone className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-medium text-blue-900 mb-2">Contacts urgents</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      •{' '}
                      <a
                        href="https://cybereponse.fr/"
                        className="hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        cybereponse.fr
                      </a>
                    </li>
                    <li>
                      •{' '}
                      <a
                        href="tel:0805691505"
                        className="hover:underline"
                      >
                        0 805 69 15 05
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz - visible si section correspondante */}
      {(!visibleSections || isSectionVisible("conclusion-quiz")) && !showQuiz && (
        <div className="flex gap-3">
          <Button onClick={() => setShowQuiz(true)} className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Évaluation finale
          </Button>
        </div>
      )}

      {/* Quiz final */}
      {showQuiz && !showQuizResults && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />🎯 Évaluation finale
            </CardTitle>
            <CardDescription>Testez vos connaissances acquises pendant la formation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Question {currentQuestion + 1}/{quizQuestions.length}
                </span>
                <Progress value={((currentQuestion + 1) / quizQuestions.length) * 100} className="w-32 h-2" />
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium mb-4">{quizQuestions[currentQuestion].question}</h3>
                <div className="space-y-2">
                  {quizQuestions[currentQuestion].options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-auto p-3 text-left"
                      onClick={() => handleQuizAnswer(index)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{String.fromCharCode(65 + index)}</span>
                        </div>
                        <span className="text-sm">{option}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Results */}
      {showQuizResults && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-green-600" />
              Résultats de l'évaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-2">{getScoreMessage(quizScore, quizQuestions.length).icon}</div>
                <h3 className="text-xl font-semibold mb-2">
                  Score : {quizScore}/{quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                </h3>
                <p
                  className={`text-sm ${
                    getScoreMessage(quizScore, quizQuestions.length).color === "green"
                      ? "text-green-700"
                      : getScoreMessage(quizScore, quizQuestions.length).color === "yellow"
                        ? "text-yellow-700"
                        : "text-red-700"
                  }`}
                >
                  {getScoreMessage(quizScore, quizQuestions.length).message}
                </p>
                <Progress value={(quizScore / quizQuestions.length) * 100} className="mt-4 h-3" />
              </div>

              <div className="space-y-3">
                {quizQuestions.map((question, index) => (
                  <Card key={index} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Question {index + 1}</span>
                        <Badge variant={answers[index] === question.correct ? "default" : "destructive"}>
                          {answers[index] === question.correct ? "Correct" : "Incorrect"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{question.question}</p>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Bonne réponse : </span>
                        {question.options[question.correct]}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center bg-white p-4 rounded-lg border">
                <h4 className="font-medium mb-2">🎓 Félicitations !</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Vous avez terminé la formation cybersécurité. N'oubliez pas de mettre en pratique ces connaissances au
                  quotidien et de rester vigilant face aux nouvelles menaces.
                </p>
                <Button onClick={onComplete} className="flex items-center gap-2 mx-auto">
                  <Trophy className="h-4 w-4" />
                  Terminer la formation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
