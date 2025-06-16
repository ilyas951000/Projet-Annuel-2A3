"use client"

import React, { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Joyride, { CallBackProps, Step } from "react-joyride"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [runTour, setRunTour] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [menuTourDone, setMenuTourDone] = useState(false)

  // Étapes du menu (globales)
  const commonSteps: Step[] = [
    {
      target: '[data-tour="annonces-livraison"]',
      content: "Voici vos annonces de livraison.",
    },
    {
      target: '[data-tour="mes-reservations"]',
      content: "Retrouvez ici toutes vos réservations.",
    },
    {
      target: '[data-tour="box-stockage"]',
      content: "Consultez les box de stockage disponibles.",
    },
  ]

  const pageSteps: Record<string, Step[]> = {
    "/dashboard/client/announcements": [
      {
        target: '[data-tour="nouvelle-annonce"]',
        content: "Créez une nouvelle annonce ici.",
      },
      {
        target: '[data-tour="carte-annonce"]',
        content: "Cliquez sur une carte pour voir les détails.",
      },
      {
        target: '[data-tour="modifier-annonce"]',
        content: "Modifiez ou supprimez votre annonce ici.",
      },
    ],
    // Ajoute d'autres routes ici si nécessaire
  }

  // Calcul des étapes à afficher
  const steps = [
    ...(menuTourDone ? [] : commonSteps),
    ...(pageSteps[pathname] || []),
  ]

  // Lecture de l’état localStorage au premier chargement
  useEffect(() => {
    const seen = localStorage.getItem("menu-tour-done") === "1"
    setMenuTourDone(seen)
  }, [])

  // Relancer le tour quand le pathname ou le menu change
  useEffect(() => {
    if (steps.length > 0) {
      setStepIndex(0)
      setRunTour(true)
    }
  }, [pathname, menuTourDone])

  const handleJoyride = (data: CallBackProps) => {
    const { status, index, type } = data

    if (["finished", "skipped"].includes(status)) {
      setRunTour(false)
      if (!menuTourDone && !pageSteps[pathname]) {
        localStorage.setItem("menu-tour-done", "1")
        setMenuTourDone(true)
      }
    } else if (type === "step:after") {
      setStepIndex(index + 1)
    }
  }

  return (
    <>
      <Joyride
        steps={steps}
        run={runTour}
        stepIndex={stepIndex}
        continuous
        showSkipButton
        scrollToFirstStep
        callback={handleJoyride}
        styles={{
          options: {
            zIndex: 9999,
            primaryColor: "#10B981",
          },
        }}
      />

      {/* Bouton pour relancer le tutoriel */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => {
            setStepIndex(0)
            setRunTour(true)
          }}
          className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg shadow hover:bg-green-700"
        >
          ▶️ Revoir le tutoriel
        </button>
      </div>

      {children}
    </>
  )
}
