export interface ModuleMeta {
  id: number
  title: string
  summary: string
  steps: string[]
  stepTitles: string[]
}

export interface TrainingContentOverrides {
  title?: string
  subtitle?: string
  modules?: Partial<ModuleMeta>[]
}

export interface TrainingContent {
  title: string
  subtitle: string
  modules: ModuleMeta[]
}

const baseModules: ModuleMeta[] = [
  {
    id: 0,
    title: "Introduction",
    summary: "Accueil, objectifs et déroulé de la demi-journée",
    steps: ["intro", "objectifs", "deroulement", "ccin"],
    stepTitles: ["Introduction générale", "Objectifs", "Déroulement", "Présentation C'CIN"],
  },
  {
    id: 1,
    title: "Introduction à la cybersécurité",
    summary: "Découvrir les concepts clés et identifier les menaces majeures",
    steps: ["concepts", "menaces", "atelier-phishing"],
    stepTitles: ["Concepts de base", "Principales menaces", "Atelier phishing"],
  },
  {
    id: 2,
    title: "Bonnes pratiques",
    summary: "Appliquer les bons réflexes au quotidien sur ses comptes et appareils",
    steps: ["module2-intro", "module2-ateliers"],
    stepTitles: ["Introduction", "Ateliers pratiques"],
  },
  {
    id: 3,
    title: "Protection des données",
    summary: "Classer les informations et limiter les risques internes",
    steps: ["module3-intro", "module3-risques", "module3-classification", "module3-ateliers"],
    stepTitles: ["Introduction", "Risques internes", "Classification données", "Ateliers pratiques"],
  },
  {
    id: 4,
    title: "Réagir aux incidents",
    summary: "Détecter et contenir rapidement un incident de sécurité",
    steps: ["module4-intro", "module4-detection", "module4-reaction", "module4-atelier"],
    stepTitles: ["Introduction", "Détecter incident", "Plan de réaction", "Atelier simulation"],
  },
  {
    id: 5,
    title: "Conclusion",
    summary: "Synthèse, ressources, quiz final et certificat",
    steps: ["conclusion-synthese", "conclusion-ressources", "conclusion-quiz", "conclusion-certificat"],
    stepTitles: ["Synthèse", "Ressources", "Quiz final", "Certificat"],
  },
]

export const defaultTrainingContent: TrainingContent = {
  title: "Formation Cybersécurité",
  subtitle: "Formation interactive - Demi-journée",
  modules: baseModules,
}

export function getTrainingContent(overrides?: TrainingContentOverrides): TrainingContent {
  if (!overrides) return defaultTrainingContent

  const mergedModules = baseModules.map((module) => {
    const override = overrides.modules?.find((m) => m.id === module.id) || {}
    return {
      ...module,
      ...override,
      stepTitles: override.stepTitles ?? module.stepTitles,
      steps: module.steps,
    }
  })

  return {
    title: overrides.title || defaultTrainingContent.title,
    subtitle: overrides.subtitle || defaultTrainingContent.subtitle,
    modules: mergedModules,
  }
}
