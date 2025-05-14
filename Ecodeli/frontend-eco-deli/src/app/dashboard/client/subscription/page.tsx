"use client"
import '../globals.css'
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

        const res = await fetch('http://localhost:3001/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Erreur récupération utilisateur")
        const authData = await res.json()
        const id = authData.userId
        setUserId(id)

        const userRes = await fetch(`http://localhost:3001/users/${id}`)
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
      await axios.patch(`http://localhost:3001/users/${userId}/subscription`, {
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
        <main className="flex-1 p-5 md:p-10 overflow-auto w-full">
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
