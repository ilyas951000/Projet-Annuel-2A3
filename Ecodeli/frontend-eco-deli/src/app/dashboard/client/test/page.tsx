// Dashboard simplified with full create & edit capability
'use client'
import '../globals.css'
import { useEffect, useState } from 'react'
import { PlusCircle, Trash2, Edit, X } from 'lucide-react'
import Image from 'next/image'

/* ---------------------------- Type definitions --------------------------- */
interface Localisation {
  currentStreet: string
  currentCity: string
  currentPostalCode: number
  destinationStreet: string
  destinationCity: string
  destinationPostalCode: number
}
interface PackageType {
  packageName: string
  packageWeight: number
  packageQuantity: number
  packageDimension: string
  localisations: Localisation[]
}
export interface Ad {
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
  advertisementBeginning?: string
  advertisementEnd?: string
  isPriority?: boolean
  packages?: PackageType[]
}

/* ------------------------------------------------------------------------- */
export default function Dashboard() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editAd, setEditAd] = useState<Ad | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
    const [userLoading, setUserLoading] = useState(true)
    const [userError, setUserError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3001/advertisements/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Erreur chargement')
        setAds(await res.json())
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAds()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette annonce ?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3001/advertisements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur suppression')
      setAds((a) => a.filter((ad) => ad.id !== id))
    } catch {
      alert('Erreur serveur')
    }
  }
  useEffect(() => {
      const fetchUser = async () => {
        try {
          const token = localStorage.getItem("token")
          if (!token) throw new Error("Token manquant")
          const res = await fetch("http://localhost:3001/auth/me", {
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

  return (
    <div className='p-4 max-w-4xl mx-auto'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold'>Mes annonces</h2>
        <button onClick={() => setShowAddModal(true)} className='bg-green-500 text-white px-4 py-2 rounded flex items-center'>
          <PlusCircle size={18} className='mr-1' /> Nouvelle
        </button>
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : error ? (
        <p className='text-red-500'>{error}</p>
      ) : (
        <div className='space-y-3'>
          {ads.map((ad) => (
            <div key={ad.id} className='border p-4 rounded bg-white flex items-center gap-4'>
              <Image src={`http://localhost:3001/uploads/${ad.advertisementPhoto}`} alt='Annonce' width={60} height={60} className='rounded object-cover' />
              <div className='flex-1 min-w-0'>
                <p className='font-medium truncate'>{ad.advertisementItem}</p>
                <p className='text-sm text-gray-500 truncate'>{ad.packages?.[0]?.localisations?.[0]?.currentCity} → {ad.packages?.[0]?.localisations?.[0]?.destinationCity}</p>
                <p className='text-sm text-gray-500'>{new Date(ad.publicationDate).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className='text-right'>
                <p className='text-green-600 font-bold'>{ad.advertisementPrice} €</p>
                <div className='flex gap-2 mt-1'>
                  <button onClick={() => setEditAd(ad)}><Edit size={16} /></button>
                  <button onClick={() => handleDelete(ad.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && userId !== null && (
        <AdFormModal
            mode='create'
            userId={userId}
            onClose={() => setShowAddModal(false)}
            onSave={(ad) => {
            setAds([ad, ...ads])
            setShowAddModal(false)
            }}
        />
        )}

      {editAd && userId !== null && (
        <AdFormModal
            mode='edit'
            ad={editAd}
            userId={userId}
            onClose={() => setEditAd(null)}
            onSave={(updated) => {
            setAds(ads.map((a) => (a.id === updated.id ? updated : a)))
            setEditAd(null)
            }}
        />
        )}

    </div>
  )
}

const today = new Date().toISOString().split('T')[0]

function AdFormModal({ mode, ad, userId, onClose, onSave }: {
  mode: 'create' | 'edit',
  ad?: Ad,
  userId: number,
  onClose: () => void,
  onSave: (ad: Ad) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [item, setItem] = useState(ad?.advertisementItem || '')
  const [quantity, setQuantity] = useState(ad?.advertisementQuantity || 1)
  const [dimension, setDimension] = useState(ad?.advertisementDimension || 'M')
  const [weight, setWeight] = useState(ad?.advertisementWeight || 0)
  const [price, setPrice] = useState(ad?.advertisementPrice || 0)
  const [currentCity, setCurrentCity] = useState(ad?.packages?.[0]?.localisations?.[0]?.currentCity || '')
  const [destinationCity, setDestinationCity] = useState(ad?.packages?.[0]?.localisations?.[0]?.destinationCity || '')
  const [beginDate, setBeginDate] = useState(ad?.advertisementBeginning || today)
  const [endDate, setEndDate] = useState(ad?.advertisementEnd || today)
  const [info, setInfo] = useState(ad?.additionalInformation || '')
  const [priority, setPriority] = useState(ad?.isPriority || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  

  useEffect(() => {
    if (file) {
        const reader = new FileReader()
        reader.onload = () => setPreview(reader.result as string)
        reader.readAsDataURL(file)
    } else if (ad?.advertisementPhoto) {
        setPreview(`http://localhost:3001/uploads/${ad.advertisementPhoto}`)
    } else {
        setPreview(null)
    }
    }, [file, ad])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 🛑 Vérification de la photo
    if (mode === 'create' && !file) {
        setError("Veuillez sélectionner une photo.")
        setLoading(false)
        return
    }

    // Récupération utilisateur (à adapter selon ta logique actuelle)
    const userId = localStorage.getItem("userId") // Remplace par le bon moyen de récupérer l'ID utilisateur
    if (!userId) {
        setError("Impossible de récupérer l'utilisateur.")
        setLoading(false)
        return
        }

    try {
        const formData = new FormData()

        // 📦 Champs principaux
        if (file) {
        formData.append("photo", file)
        formData.append("photoName", file.name)
        }
        formData.append("advertisementItem", item)
        formData.append("advertisementQuantity", quantity.toString())
        formData.append("advertisementDimension", dimension)
        formData.append("advertisementWeight", weight.toString())
        formData.append("advertisementPrice", price.toString())
        formData.append("additionalInformation", info)
        formData.append("advertisementBeginning", beginDate)
        formData.append("advertisementEnd", endDate)
        formData.append("isPriority", priority.toString())
        formData.append("publicationDate", new Date().toISOString())
        formData.append("creatorRole", "client")
        formData.append("advertisementStatus", "en attente") // ou utilise une variable
        formData.append("usersId", userId)

        // 📍Localisation + contenu du colis
        const packages = [
        {
            quantity,
            item,
            dimension,
            weight,
            prioritaire: priority,
            localisations: [
            {
                currentStreet: '',
                currentCity,
                currentPostalCode: 0,
                destinationStreet: '',
                destinationCity,
                destinationPostalCode: 0,
            },
            ],
        },
        ]
        formData.append("packages", JSON.stringify(packages))

        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:3001/advertisements", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
        })

        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        onSave(data)

    } catch (err: any) {
        setError(err.message)
    } finally {
        setLoading(false)
    }
    }


  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white p-6 rounded w-full max-w-md'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold'>{mode === 'create' ? 'Nouvelle annonce' : `Modifier annonce #${ad?.id}`}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className='space-y-3'>
          <input type='file' accept='image/*' onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {preview && <img src={preview} alt='Prévisualisation' className='w-full h-32 object-cover rounded' />}
          <input value={item} onChange={(e) => setItem(e.target.value)} required placeholder='Objet' className='w-full border px-2 py-1 rounded' />
          <div className='grid grid-cols-3 gap-2'>
            <input type='number' value={quantity} onChange={(e) => setQuantity(+e.target.value)} min={1} className='w-full border px-2 py-1 rounded' placeholder='Qté' />
            <input type='number' value={weight} onChange={(e) => setWeight(+e.target.value)} step='0.1' className='w-full border px-2 py-1 rounded' placeholder='Poids' />
            <select value={dimension} onChange={(e) => setDimension(e.target.value)} className='w-full border px-2 py-1 rounded'>
              {['XS','S','M','L','XL'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <input type='number' value={price} onChange={(e) => setPrice(+e.target.value)} step='0.01' className='w-full border px-2 py-1 rounded' placeholder='Prix €' />
          <div className='grid grid-cols-2 gap-2'>
            <input value={currentCity} onChange={(e) => setCurrentCity(e.target.value)} className='w-full border px-2 py-1 rounded' placeholder='Départ' />
            <input value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} className='w-full border px-2 py-1 rounded' placeholder='Arrivée' />
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <input type='date' value={beginDate} onChange={(e) => setBeginDate(e.target.value)} className='w-full border px-2 py-1 rounded' />
            <input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} className='w-full border px-2 py-1 rounded' />
          </div>
          <textarea value={info} onChange={(e) => setInfo(e.target.value)} className='w-full border px-2 py-1 rounded' placeholder='Infos supplémentaires' />
          <label className='flex items-center gap-2'>
            <input type='checkbox' checked={priority} onChange={(e) => setPriority(e.target.checked)} /> Prioritaire
          </label>
          {error && <p className='text-red-500'>{error}</p>}
          <button type='submit' disabled={loading} className='w-full bg-green-500 text-white py-2 rounded'>
            {loading ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}
