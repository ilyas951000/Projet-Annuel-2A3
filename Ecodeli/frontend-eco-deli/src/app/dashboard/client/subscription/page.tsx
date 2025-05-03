"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Moon, Sun, Settings, PlusCircle, User, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [subscription, setSubscription] = useState<number>(0)
  const [userId, setUserId] = useState<number | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)


  const getSubscriptionLabel = (level: number) => {
    switch (level) {
      case 0:
        return "Free"
      case 1:
        return "Starter"
      case 2:
        return "Premium"
      default:
        return "Inconnu"
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error("Token manquant")

        const res = await fetch('http://127.0.0.1:3001/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Erreur récupération utilisateur")
        const authData = await res.json()
        const id = authData.userId
        setUserId(id)

        const userRes = await fetch(`http://127.0.0.1:3001/users/${id}`)
        if (!userRes.ok) throw new Error("Erreur récupération infos utilisateur")
        const userData = await userRes.json()

        if (typeof userData.userSubscription === 'number') {
          setSubscription(userData.userSubscription)
        }
      } catch (err: any) {
        setUserError(err.message)
      } finally {
        setUserLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleSubscriptionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = parseInt(e.target.value, 10)
    setSubscription(newLevel)

    if (userId == null) {
      alert("Utilisateur non identifié.")
      return
    }

    try {
      await axios.patch(`http://127.0.0.1:3001/users/${userId}/subscription`, {
        userSubscription: newLevel,
      })
      alert("Abonnement mis à jour !")
    } catch (error) {
      console.error(error)
      alert("Échec de la mise à jour.")
    }
  }
  

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <aside
          className={`fixed z-40 top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 p-5 flex-col justify-between transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex`}
        >
          <div>
            <div className="flex justify-between items-center md:hidden mb-6">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">EcoDeli</h1>
              <button onClick={() => setSidebarOpen(false)}><X className="text-gray-700 dark:text-white" /></button>
            </div>

            <Link href="/connexion" className="bg-green-600 px-4 py-2 rounded-lg text-black font-semibold inline-block mb-4">
              <Image src="/logo1.png" alt="EcoDeli Logo" width={120} height={20} className="h-10 w-auto" />
            </Link>

            <nav className="mt-5">
              <ul className="space-y-3">
                <NavItem title="Accueil" link="../client" />
                <NavItem title="Mes Annonces" link="./announcements" />
                <NavItem title="Annonces des Autres" link="./otherAnnouncements" />
                <NavItem title="Suivi des Livraisons" link="/suivi-livraisons" />
                <NavItem title="Mes Paiements" link="/paiements" />
                <NavItem title="Abonnement" link="./subscription" />
                <NavItem title="Services & Prestataires" link="/services" />
                <NavItem title="Profil / Compte" link="/compte" />
              </ul>
            </nav>

            <div className="mt-10 space-y-3">
              <NavItem title="À propos" link="/a-propos" />
              <NavItem title="Nous contacter" link="/contact" />
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-10">
            <User className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-300">Mon compte</span>
            <Settings className="w-5 h-5 text-gray-500 dark:text-gray-300 cursor-pointer" />
          </div>
        </aside>

        <main className="flex-1 p-5 md:p-10 overflow-auto w-full">
          <div className="flex justify-between items-center md:hidden mb-5">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
            <button
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-900" />}
            </button>
          </div>

          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
            Bienvenue Chez <span className="text-black">Eco</span>
            <span className="text-green-500">Deli</span> - partie Client
          </h2>

          {userLoading ? (
            <p className="text-gray-700 dark:text-gray-300">Chargement...</p>
          ) : userError ? (
            <p className="text-red-600 dark:text-red-400">Erreur : {userError}</p>
          ) : (
            
            <div className="mt-6 max-w-md">
              <p className="mb-4 text-gray-800 dark:text-white">
                Votre abonnement actuel est : <strong>{getSubscriptionLabel(subscription)}</strong>
              </p>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Choisir un abonnement :
              </label>
              <select
                value={subscription}
                onChange={handleSubscriptionChange}
                className="p-2 border rounded w-full dark:bg-gray-700 dark:text-white"
              >
                <option value={0}>Free</option>
                <option value={1}>Starter</option>
                <option value={2}>Premium</option>
              </select>
            </div>
          )}
        </main>

        <button
          className="hidden md:block absolute top-5 right-5 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-900" />}
        </button>
      </div>
    </div>
  )
}

function NavItem({ title, link }: { title: string; link: string }) {
  return (
    <li className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md">
      <PlusCircle className="w-4 h-4" />
      <Link href={link}>
        <span>{title}</span>
      </Link>
    </li>
  )
}
