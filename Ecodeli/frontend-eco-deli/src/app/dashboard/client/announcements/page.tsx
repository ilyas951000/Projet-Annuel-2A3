"use client"

import { useEffect, useState } from "react"
import { Settings, PlusCircle, User, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Ad {
  id: number
  advertisementPhoto?: string
  advertisementQuantity: number
  advertisementItem: string
  publicationDate: string
  advertisementDimension?: string
  advertisementWeight?: number
  additionalInformation?: string
  advertisementPrice: number
  advertisementStatus?: string
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [advertisementQuantity, setAdvertisementQuantity] = useState(0)
  const [advertisementPrice, setAdvertisementPrice] = useState(0)
  const [advertisementWeight, setAdvertisementWeight] = useState(0)
  const [advertisementDimension, setAdvertisementDimension] = useState("")
  const [advertisementItem, setAdvertisementItem] = useState("")
  const [additionalInformation, setAdditionalInformation] = useState("")
  const [advertisementStatus, setAdvertisementStatus] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [errorAdd, setErrorAdd] = useState<string | null>(null)
  const [loadingAdd, setLoadingAdd] = useState(false)

  const [userId, setUserId] = useState<number | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  const [ads, setAds] = useState<Ad[]>([])
  const [loadingAds, setLoadingAds] = useState(true)
  const [errorAds, setErrorAds] = useState<string | null>(null)

  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error("Token manquant")
        const res = await fetch('http://127.0.0.1:3001/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Erreur récupération utilisateur")
        const data = await res.json()
        setUserId(data.userId)
      } catch (err: any) {
        setUserError(err.message)
      } finally {
        setUserLoading(false)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (!userLoading && userId) {
      const fetchAds = async () => {
        try {
          const token = localStorage.getItem('token')
          const res = await fetch('http://127.0.0.1:3001/advertisements/me', {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) throw new Error(await res.text())
          setAds(await res.json())
        } catch (err: any) {
          setErrorAds(err.message)
        } finally {
          setLoadingAds(false)
        }
      }
      fetchAds()
    }
  }, [userLoading, userId])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingAdd(true)
    setErrorAdd(null)
    if (!file) {
      setErrorAdd("Veuillez sélectionner une photo.")
      setLoadingAdd(false)
      return
    }
    if (userLoading || userError || userId === null) {
      setErrorAdd("Impossible de récupérer l'utilisateur.")
      setLoadingAdd(false)
      return
    }
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
      formData.append('photoName', file.name)
      formData.append('publicationDate', new Date().toISOString())
      formData.append('usersId', userId.toString())

      const token = localStorage.getItem('token')
      const res = await fetch('http://127.0.0.1:3001/advertisements', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) throw new Error(await res.text())
      setAds([])
      setLoadingAds(true)
      setShowAddModal(false)
      setAdvertisementQuantity(0)
      setAdvertisementPrice(0)
      setAdvertisementWeight(0)
      setAdvertisementDimension("")
      setAdvertisementItem("")
      setAdditionalInformation("")
      setAdvertisementStatus("")
      setFile(null)
    } catch (err: any) {
      setErrorAdd(err.message)
    } finally {
      setLoadingAdd(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)}/>
      )}
      <aside className={`fixed z-40 top-0 left-0 h-full w-64 bg-white p-5 flex-col justify-between transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}>
        <div>
          <div className="flex justify-between items-center md:hidden mb-6">
            <h1 className="text-xl font-bold text-gray-900">EcoDeli</h1>
            <button onClick={() => setSidebarOpen(false)}><X className="text-gray-700"/></button>
          </div>
          <Link href="/connexion" className="bg-green-600 px-4 py-2 rounded-lg text-black font-semibold inline-block mb-4">
            <Image src="/logo1.png" alt="EcoDeli Logo" width={120} height={20} className="h-10 w-auto"/>
          </Link>
          <nav className="mt-5">
            <ul className="space-y-3">
                <NavItem title="Accueil" link="../client" />
                <NavItem title="Mes Annonces" link="./announcements" />
                <NavItem title="Annonces des Autres" link=".//otherAnnouncements" />
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
          <User className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">Mon compte</span>
          <Settings className="w-5 h-5 text-gray-500 cursor-pointer" />
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-10 overflow-auto w-full">
        <div className="flex justify-between items-center md:hidden mb-5">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6 text-gray-900"/></button>
        </div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">
          Bienvenue Chez <span className="text-black">Eco</span><span className="text-green-500">Deli</span> - Mes annonces
        </h2>

        {/* Listing des annonces */}
        {loadingAds ? (
          <p>Chargement des annonces...</p>
        ) : errorAds ? (
          <p className="text-red-500">{errorAds}</p>
        ) : (
          <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Objet</th>
                <th className="px-4 py-2">Prix (€)</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map(ad => (
                <tr key={ad.id} className="border-t">
                  <td className="px-4 py-2">{ad.advertisementItem}</td>
                  <td className="px-4 py-2">{ad.advertisementPrice.toFixed(2)}</td>
                  <td className="px-4 py-2">{new Date(ad.publicationDate).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => setSelectedAd(ad)} className="text-blue-600 hover:underline">Voir plus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* Bouton + pour ajouter */}
      <button onClick={() => setShowAddModal(true)} className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg">
        <PlusCircle className="w-6 h-6" />
      </button>

      {/* Modal Ajouter */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Ajouter une annonce</h3>
            <form className="space-y-4" onSubmit={handleAddSubmit}>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Quantité</label>
                <input type="number" min="1" value={advertisementQuantity} onChange={e => setAdvertisementQuantity(+e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Prix (€)</label>
                <input type="number" step="0.01" value={advertisementPrice} onChange={e => setAdvertisementPrice(+e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Poids (kg)</label>
                <input type="number" step="0.01" value={advertisementWeight} onChange={e => setAdvertisementWeight(+e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Dimensions</label>
                <input type="text" value={advertisementDimension} onChange={e => setAdvertisementDimension(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" placeholder="30x20x10 cm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Objet</label>
                <input type="text" value={advertisementItem} onChange={e => setAdvertisementItem(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" placeholder="Nom de l'objet" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Informations complémentaires</label>
                <textarea value={additionalInformation} onChange={e => setAdditionalInformation(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-2">Photo de l'objet</h4>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              {errorAdd && <p className="text-red-500">{errorAdd}</p>}
              <button type="submit" disabled={loadingAdd} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full">
                {loadingAdd ? "En cours..." : "Enregistrer"}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedAd && <EditAdModal ad={selectedAd} onClose={() => setSelectedAd(null)} onSave={updated => setAds(ads.map(a => a.id === updated.id ? updated : a))} />}
    </div>
  )
}

function NavItem({ title, link }: { title: string; link: string }) {
  return (
    <li className="flex items-center space-x-2 text-gray-700 hover:text-green-500 cursor-pointer p-2 rounded-md">
      <PlusCircle className="w-4 h-4" />
      <Link href={link}><span>{title}</span></Link>
    </li>
  )
}

function EditAdModal({ ad, onClose, onSave }: { ad: Ad; onClose: () => void; onSave: (ad: Ad) => void }) {
  const [quantity, setQuantity] = useState(ad.advertisementQuantity)
  const [price, setPrice] = useState(ad.advertisementPrice)
  const [weight, setWeight] = useState(ad.advertisementWeight || 0)
  const [dimension, setDimension] = useState(ad.advertisementDimension || "")
  const [item, setItem] = useState(ad.advertisementItem)
  const [info, setInfo] = useState(ad.additionalInformation || "")
  const [status, setStatus] = useState(ad.advertisementStatus || "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://127.0.0.1:3001/advertisements/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ advertisementQuantity: quantity, advertisementPrice: price, advertisementWeight: weight, advertisementDimension: dimension, advertisementItem: item, additionalInformation: info, advertisementStatus: status })
      })
      if (!res.ok) throw new Error(await res.text())
      const updated = await res.json()
      onSave(updated)
      onClose()
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
        <h3 className="text-xl font-semibold mb-4">Modifier l'annonce #{ad.id}</h3>
        <form onSubmit={handleSave} className="space-y-3">
          <div><label className="block text-sm mb-1">Quantité</label><input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)} className="w-full border rounded p-2" required /></div>
          <div><label className="block text-sm mb-1">Prix (€)</label><input type="number" step="0.01" value={price} onChange={e => setPrice(+e.target.value)} className="w-full border rounded p-2" required /></div>
          <div><label className="block text-sm mb-1">Poids (kg)</label><input type="number" step="0.01" value={weight} onChange={e => setWeight(+e.target.value)} className="w-full border rounded p-2" required /></div>
          <div><label className="block text-sm mb-1">Dimensions</label><input type="text" value={dimension} onChange={e => setDimension(e.target.value)} className="w-full border rounded p-2" /></div>
          <div><label className="block text-sm mb-1">Objet</label><input type="text" value={item} onChange={e => setItem(e.target.value)} className="w-full border rounded p-2" required /></div>
          <div><label className="block text-sm mb-1">Informations complémentaires</label><textarea value={info} onChange={e => setInfo(e.target.value)} className="w-full border rounded p-2" /></div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Annuler</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-green-500 text-white">{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}