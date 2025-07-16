"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Menu, X, PlusCircle, User, Settings } from "lucide-react"

import Link from "next/link"
import Image from "next/image"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)
  const [tutorialActive, setTutorialActive] = useState(false)

  useEffect(() => {
    const tutorialSeen = localStorage.getItem("tutorialSeen")
    if (!tutorialSeen) {
      setTutorialActive(true)
    }
  }, [])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [forceOpenMenus, setForceOpenMenus] = useState<{ [key: string]: boolean }>({})
  const submenuTriggers: { [key: string]: string } = {
  '[data-tour="suivi-livraison"]': "annonces-livraison",
  '[data-tour="autres-annonces"]': "annonces-livraison",
  '[data-tour="payer-livraisons"]': "annonces-livraison",
  '[data-tour="prestations"]': "prestations",
  '[data-tour="mes-reservations"]': "prestations",
  '[data-tour="les-prestataires"]': "prestations",
  '[data-tour="wallet"]': "payements",
  '[data-tour="validation-payement"]': "payements",
}

  const steps = [
    { selector: '[data-tour="annonces-livraison"]', text: "Voici Les Annonces de livraison" },
    { selector: '[data-tour="suivi-livraison"]', text: "Voici le suivi de vos livraisons" },
    { selector: '[data-tour="autres-annonces"]', text: "Consultez les annonces disponibles autour de vous" },
    { selector: '[data-tour="payer-livraisons"]', text: "Ici vous pouvez payer vos livraisons" },
    { selector: '[data-tour="prestations"]', text: "Accédez à vos prestations" },
    { selector: '[data-tour="mes-reservations"]', text: "Voici vos réservations de prestations" },
    { selector: '[data-tour="les-prestataires"]', text: "Voici la liste des prestataires disponibles" },
    { selector: '[data-tour="listLivreur"]', text: "Voici la liste des livreurs" },
    { selector: '[data-tour="boxes"]', text: "Gérez vos boxes" },
    { selector: '[data-tour="messages"]', text: "Voici vos messages" },
    { selector: '[data-tour="wallet"]', text: "Votre portefeuille" },
    { selector: '[data-tour="validation-payement"]', text: "Validation des paiements" },
    { selector: '[data-tour="abonnement"]', text: "Vos abonnements" },
    { selector: '[data-tour="news"]', text: "Les dernières nouvelles" },
    { selector: '[data-tour="compte"]', text: "Votre profil et informations de compte" },
    { selector: '[data-tour="a-propos"]', text: "En savoir plus sur EcoDeli" },
    { selector: '[data-tour="contact"]', text: "Nous contacter" },
  ]

  const currentStep = tutorialActive ? steps[stepIndex] : null

  const handleLogout = () => {
    localStorage.removeItem("token") 
    window.location.href = "/../../connexion" // 
  }



  useEffect(() => {
  if (!currentStep?.selector) return

  document.querySelectorAll(".spotlight").forEach((el) => {
    el.classList.remove("spotlight")
  })

  const el = document.querySelector(currentStep.selector)
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" })
    el.classList.add("spotlight")
  }

  const menuKey = submenuTriggers[currentStep.selector]
  if (menuKey) {
    setForceOpenMenus((prev) => ({ ...prev, [menuKey]: true }))
    setTimeout(() => {
      const el = document.querySelector(currentStep.selector)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        el.classList.add("spotlight")
      }
    }, 300)
  }

  return () => {
    // Nettoie l’effet précédent
    const el = document.querySelector(currentStep.selector)
    if (el) el.classList.remove("spotlight")
  }
}, [stepIndex, currentStep?.selector])


  return (
    
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 relative">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`
            fixed z-40 top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 p-5
            flex-col justify-between transform transition-transform duration-300
            ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:flex
          `}
        >
          <div>
            <div className="flex justify-between items-center md:hidden mb-6">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">EcoDeli</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="text-gray-700 dark:text-white" />
              </button>
            </div>

            <Link href="/dashboard/client" className="bg-green-600 px-4 py-2 rounded-lg text-black font-semibold inline-block mb-4">
              <Image src="/logo1.png" alt="EcoDeli Logo" width={120} height={20} className="h-10 w-auto" />
            </Link>

            <nav>
              <ul className="space-y-3">
                <NavItem title="Accueil" link="/dashboard/client" />

                <NavItem
                  title="Les Annonces de livraison"
                  dataTour="annonces-livraison"
                  forceOpen={forceOpenMenus["annonces-livraison"]}
                  subLinks={[
                    { title: "Le Suivi de mes livraisons", link: "/dashboard/client/suivi_livraison", dataTour: "suivi-livraison" },
                    { title: "Les annonces des autres...", link: "/dashboard/client/otherAnnouncements", dataTour: "autres-annonces" },
                    
                  ]}
                />
                <NavItem
                  title="Les Prestations"
                  dataTour="prestations"
                  forceOpen={forceOpenMenus["prestations"]}
                  subLinks={[
                    { title: "Mes Reservations", link: "/dashboard/client/MesReservations", dataTour: "mes-reservations" },
                    { title: "Les Prestataires", link: "/dashboard/client/prestation", dataTour: "les-prestataires" },
                  ]}

                />
                <NavItem title="Liste des livreurs" link="/dashboard/client/listLivreur" dataTour="listLivreur" />
                <NavItem title="Les Boxes" link="/dashboard/client/boxes" dataTour="boxes" />
                <NavItem title="Mes Messages" link="/dashboard/client/clientMessagesPage" dataTour="messages" />
                <NavItem
                  title="Les Payements"
                  dataTour="payements"
                  forceOpen={forceOpenMenus["payements"]}
                  subLinks={[
                    { title: "Effectuer paiement", link: "/dashboard/client/payementpackage", dataTour: "payementpackage" },
                    { title: "Mon Wallet", link: "/dashboard/client/wallet", dataTour: "wallet" },
                    { title: "Validation des payements", link: "/dashboard/client/historyannonce", dataTour: "validation-payement" },
                    { title: "Vos gains", link: "/dashboard/client/earnings", dataTour: "earnings" },
                  ]}
                />
                <NavItem title="Abonnement" link="/dashboard/client/subscription" dataTour="abonnement" />
                <NavItem title="News" link="/dashboard/client/news" dataTour="news" />
                <NavItem title="Profil / Compte" link="/dashboard/client/compte" dataTour="compte" />
                <NavItem title="À propos" link="/a-propos" dataTour="a-propos" />
                <NavItem title="Nous contacter" link="/contact" dataTour="contact" />
              </ul>
            </nav>
          </div>

          <div className="flex flex-col mt-10 space-y-2">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-500 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-300">Mon compte</span>
              <Settings className="w-5 h-5 text-gray-500 dark:text-gray-300 cursor-pointer" />
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-green-600 text-black font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Déconnexion
            </button>

          </div>

        </aside>

        <main className="flex-1 p-5 md:p-10 overflow-auto w-full">
          <div className="flex justify-between items-center md:hidden mb-5">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
            <button className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-900" />}
            </button>
          </div>
          {children}
        </main>

        <button
          className="hidden md:block absolute top-5 right-5 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-900" />}
        </button>

        {currentStep && (
          <div
            className="fixed z-[1001] bg-white text-black p-4 rounded-lg shadow max-w-xs"
            style={{
              top: 100,
              left: 280,
            }}
          >
            <p>{currentStep.text}</p>
            <button
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
              onClick={() => {
                if (stepIndex < steps.length - 1) {
                  setStepIndex(stepIndex + 1)
                } else {
                  const el = document.querySelector(currentStep.selector)
                  if (el) el.classList.remove("spotlight")
                  localStorage.setItem("tutorialSeen", "true")
                  setTutorialActive(false)
                }

              }}
            >
              {stepIndex < steps.length - 1 ? "Suivant" : "Terminer"}
            </button>
          </div>
        )}

      </div>
      <style jsx global>{`
        .spotlight {
          position: relative;
          z-index: 9999;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
          border-radius: 8px;
          transition: box-shadow 0.3s ease;
        }

        .spotlight::after {
          content: '';
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          border: 2px solid rgba(255, 255, 255, 0.8);
          border-radius: 10px;
          animation: pulse 1.5s infinite;
          pointer-events: none;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
    
  )
}

function NavItem({
  title,
  link,
  subLinks,
  dataTour,
  forceOpen = false,
}: {
  title: string
  link?: string
  subLinks?: { title: string; link: string; dataTour?: string }[]
  dataTour?: string
  forceOpen?: boolean
}) {
  const [open, setOpen] = useState(forceOpen)

  useEffect(() => {
    setOpen(forceOpen)
  }, [forceOpen])

  if (subLinks && subLinks.length > 0) {
    return (
      
      <li data-tour={dataTour}>
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md"
        >
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-4 h-4" />
            <span>{title}</span>
          </div>
          <span>{open ? "▲" : "▼"}</span>
        </div>
        {open && (
          <ul className="ml-6 mt-1 space-y-2">
            {subLinks.map((subItem) => (
              <li key={subItem.link} data-tour={subItem.dataTour}>
                <Link
                  href={subItem.link}
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-green-500"
                >
                  {subItem.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
    
  }

  return (
    
    <li data-tour={dataTour}>
      <Link
        href={link || "#"}
        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md"
      >
        <PlusCircle className="w-4 h-4" />
        <span>{title}</span>
      </Link>
    </li>
  )
}
