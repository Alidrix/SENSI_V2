"use client"

// Fonction pour générer un certificat PDF avec jsPDF
export const generateCertificatePDF = (certificateData: {
  name: string
  score: number
  date: string
  modules: string[]
  organisme: string
}) => {
  // Créer un canvas pour dessiner le certificat
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) return

  // Dimensions A4 en pixels (300 DPI)
  canvas.width = 2480
  canvas.height = 3508

  // Fond blanc
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Bordure
  ctx.strokeStyle = "#059669"
  ctx.lineWidth = 8
  ctx.strokeRect(100, 100, canvas.width - 200, canvas.height - 200)

  // Bordure intérieure
  ctx.strokeStyle = "#d1d5db"
  ctx.lineWidth = 2
  ctx.strokeRect(150, 150, canvas.width - 300, canvas.height - 300)

  // Titre principal
  ctx.fillStyle = "#1f2937"
  ctx.font = "bold 120px Arial"
  ctx.textAlign = "center"
  ctx.fillText("CERTIFICAT DE FORMATION", canvas.width / 2, 600)

  // Sous-titre
  ctx.fillStyle = "#059669"
  ctx.font = "bold 80px Arial"
  ctx.fillText("Cybersécurité - Sensibilisation", canvas.width / 2, 750)

  // Texte "Certifie que"
  ctx.fillStyle = "#6b7280"
  ctx.font = "60px Arial"
  ctx.fillText("Certifie que", canvas.width / 2, 1000)

  // Nom du participant
  ctx.fillStyle = "#1f2937"
  ctx.font = "bold 100px Arial"
  ctx.fillText(certificateData.name, canvas.width / 2, 1200)

  // Texte "a suivi avec succès"
  ctx.fillStyle = "#6b7280"
  ctx.font = "60px Arial"
  ctx.fillText("a suivi avec succès la formation", canvas.width / 2, 1400)

  // Nom de la formation
  ctx.fillStyle = "#059669"
  ctx.font = "bold 70px Arial"
  ctx.fillText('"Cybersécurité : Bonnes pratiques et sensibilisation"', canvas.width / 2, 1600)

  // Score
  ctx.fillStyle = "#1f2937"
  ctx.font = "60px Arial"
  ctx.fillText(`avec un score de ${certificateData.score}%`, canvas.width / 2, 1800)

  // Date et organisme
  ctx.fillStyle = "#6b7280"
  ctx.font = "50px Arial"
  ctx.textAlign = "left"
  ctx.fillText(`Date de formation: ${certificateData.date}`, 300, 2400)
  ctx.textAlign = "right"
  ctx.fillText(`Organisme: ${certificateData.organisme}`, canvas.width - 300, 2400)

  // Détails de la formation
  ctx.fillStyle = "#9ca3af"
  ctx.font = "40px Arial"
  ctx.textAlign = "center"
  ctx.fillText("Formation interactive - Durée : 2h", canvas.width / 2, 2800)
  ctx.fillText(
    "Modules : Introduction, Bonnes pratiques, Protection des données, Gestion d'incidents",
    canvas.width / 2,
    2900,
  )

  // Convertir en blob et télécharger
  const dataUrl = canvas.toDataURL("image/jpeg", 0.95)
  const pdfBlob = createPdfFromImage(dataUrl, canvas.width, canvas.height)

  const url = URL.createObjectURL(pdfBlob)
  const a = document.createElement("a")
  a.href = url
  a.download = `certificat-cybersecurite-${certificateData.name.replace(/\s+/g, "-")}-${new Date()
    .toISOString()
    .split("T")[0]}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Fonction alternative avec HTML2Canvas si disponible
export const generateCertificatePDFAdvanced = (certificateData: {
  name: string
  score: number
  date: string
  modules: string[]
  organisme: string
}) => {
  // Fallback vers la méthode canvas simple
  generateCertificatePDF(certificateData)
}

const createPdfFromImage = (dataUrl: string, width: number, height: number) => {
  const encoder = new TextEncoder()
  const imageData = atob(dataUrl.split(",")[1])
  const imageBytes = new Uint8Array(imageData.length)
  for (let i = 0; i < imageData.length; i++) {
    imageBytes[i] = imageData.charCodeAt(i)
  }

  const chunks: Uint8Array[] = []
  const offsets: number[] = []
  let offset = 0

  const pushText = (text: string) => {
    const data = encoder.encode(text)
    chunks.push(data)
    offset += data.length
  }

  const pushBinary = (data: Uint8Array) => {
    chunks.push(data)
    offset += data.length
  }

  pushText("%PDF-1.3\n")

  offsets[1] = offset
  pushText("1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n")

  offsets[2] = offset
  pushText("2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n")

  offsets[3] = offset
  pushText(
    `3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${width} ${height}]/Resources<</XObject<</Im0 4 0 R>>/ProcSet[/PDF /ImageC]>>/Contents 5 0 R>>endobj\n`,
  )

  offsets[4] = offset
  pushText(
    `4 0 obj<</Type/XObject/Subtype/Image/Width ${width}/Height ${height}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${imageBytes.length}>>stream\n`,
  )
  pushBinary(imageBytes)
  pushText("\nendstream\nendobj\n")

  const contentStream = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`
  offsets[5] = offset
  pushText(`5 0 obj<</Length ${contentStream.length}>>stream\n${contentStream}endstream\nendobj\n`)

  const xrefPosition = offset
  pushText("xref\n0 6\n0000000000 65535 f \n")
  for (let i = 1; i <= 5; i++) {
    pushText(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`)
  }
  pushText("trailer<</Size 6/Root 1 0 R>>\nstartxref\n")
  pushText(`${xrefPosition}\n%%EOF`)

  const totalLength = chunks.reduce((len, chunk) => len + chunk.length, 0)
  const pdfBytes = new Uint8Array(totalLength)
  let position = 0
  chunks.forEach((chunk) => {
    pdfBytes.set(chunk, position)
    position += chunk.length
  })

  return new Blob([pdfBytes], { type: "application/pdf" })
}
