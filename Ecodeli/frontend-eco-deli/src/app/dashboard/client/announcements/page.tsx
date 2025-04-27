"use client"

import { useEffect, useState } from "react"
import { Settings, PlusCircle, User, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const [advertisementQuantity, setAdvertisementQuantity] = useState(0)
  const [advertisementPrice, setAdvertisementPrice] = useState(0)
  const [advertisementWeight, setAdvertisementWeight] = useState(0)
  const [advertisementDimension, setAdvertisementDimension] = useState("")
  const [advertisementItem, setAdvertisementItem] = useState("")
  const [additionalInformation, setAdditionalInformation] = useState("")
  const [advertisementStatus, setAdvertisementStatus] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [userId, setUserId] = useState<number | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.error("❌ Aucun token trouvé dans le localStorage")
          setUserError("Token manquant")
          setUserLoading(false)
          return
        }
        
        console.log("Token récupéré:", token)
  
        const res = await fetch('http://127.0.0.1:3001/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
  
        console.log("📡 Status de la réponse:", res.status)
  
        if (!res.ok) {
          const text = await res.text()
          console.log("Réponse non OK:", text)
          throw new Error("Erreur lors de la récupération de l'utilisateur")
        }
  
        const data = await res.json()
        console.log("Données utilisateur récupérées:", data)
        console.log(Object.keys(data), data)
  
        setUserId(data.userId)
      } catch (err: any) {
        console.error("Erreur dans fetchUserId:", err)
        setUserError(err.message)
      } finally {
        setUserLoading(false)
      }
    }
  
    fetchUserId()
  }, [])
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
  
    if (!file) {
      setError("Veuillez sélectionner une photo.")
      setLoading(false)
      return
    }
  
    if (userLoading) {
      setError("Chargement de l'utilisateur en cours...")
      setLoading(false)
      return
    }
  
    if (userError || userId === null) {
      setError("Impossible de récupérer l'utilisateur.")
      setLoading(false)
      return
    }
  
    console.log("Utilisateur ID:", userId); 
  
    const fileName = file.name
  
    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('advertisementQuantity', advertisementQuantity.toString())
      formData.append('advertisementPrice', advertisementPrice.toString())
      formData.append('advertisementWeight', advertisementWeight.toString())
      formData.append('advertisementDimension', advertisementDimension)
      formData.append('advertisementItem', advertisementItem)
      formData.append('additionalInformation', additionalInformation)
      formData.append('creatorRole', 'user')
      formData.append('advertisementStatus', advertisementStatus)
      formData.append('photoName', fileName)
      formData.append('publicationDate', new Date().toISOString())
      formData.append('usersId', userId.toString())

  
      console.log("Données envoyées au backend :")
      for (let pair of formData.entries()) {
        console.log(`- ${pair[0]}:`, pair[1])
      }
  
      const token = localStorage.getItem('token')
      const res = await fetch('http://127.0.0.1:3001/advertisements', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
  
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || res.statusText)
      }
  
      setShowModal(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`fixed z-40 top-0 left-0 h-full w-64 bg-white p-5 flex-col justify-between transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}>
        <div>
          <div className="flex justify-between items-center md:hidden mb-6">
            <h1 className="text-xl font-bold text-gray-900">EcoDeli</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="text-gray-700" />
            </button>
          </div>

          <Link href="/connexion" className="bg-green-600 px-4 py-2 rounded-lg text-black font-semibold inline-block mb-4">
            <Image src="/logo1.png" alt="EcoDeli Logo" width={120} height={20} className="h-10 w-auto" />
          </Link>

          <nav className="mt-5">
            <ul className="space-y-3">
              <NavItem title="Accueil" link="/" />
              <NavItem title="Mes Annonces" link="/mes-annonces" />
              <NavItem title="Annonces des Autres" link="/annonces-autres" />
              <NavItem title="Suivi des Livraisons" link="/suivi-livraisons" />
              <NavItem title="Mes Paiements" link="/paiements" />
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
          <User className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">Mon compte</span>
          <Settings className="w-5 h-5 text-gray-500 cursor-pointer" />
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-10 overflow-auto w-full">
        <div className="flex justify-between items-center md:hidden mb-5">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        <h2 className="text-3xl font-semibold text-gray-900">
          Bienvenue Chez <span className="text-black">Eco</span>
          <span className="text-green-500">Deli</span> - Mes annonces
        </h2>
      </main>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Ajouter une annonce</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Quantité</label>
                <input type="number" min="1" value={advertisementQuantity} onChange={e => setAdvertisementQuantity(+e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Prix (€)</label>
                <input type="number" step="0.01" value={advertisementPrice} onChange={e => setAdvertisementPrice(+e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Poids (kg)</label>
                <input type="number" step="0.01" value={advertisementWeight} onChange={e => setAdvertisementWeight(+e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Dimensions</label>
                <input type="text" value={advertisementDimension} onChange={e => setAdvertisementDimension(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900" placeholder="30x20x10 cm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Objet</label>
                <input type="text" value={advertisementItem} onChange={e => setAdvertisementItem(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900" placeholder="Nom de l'objet" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Informations complémentaires</label>
                <textarea value={additionalInformation} onChange={e => setAdditionalInformation(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Type d’envoi</label>
                <select value={advertisementStatus} onChange={e => setAdvertisementStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900" required>
                  <option value="" disabled>-- Choisir une formule --</option>
                  <option value="free">Free - Supplément de 5%</option>
                  <option value="starter">Starter - 3 envois prioritaires offerts, puis 5%</option>
                  <option value="autres">Autres formules - Supplément de 15%</option>
                </select>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Photo de l'objet</h4>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900" required />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full">
                {loading ? "En cours..." : "Enregistrer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function NavItem({ title, link }: { title: string; link: string }) {
  return (
    <li className="flex items-center space-x-2 text-gray-700 hover:text-green-500 cursor-pointer p-2 rounded-md">
      <PlusCircle className="w-4 h-4" />
      <Link href={link}>
        <span>{title}</span>
      </Link>
    </li>
  )
}
