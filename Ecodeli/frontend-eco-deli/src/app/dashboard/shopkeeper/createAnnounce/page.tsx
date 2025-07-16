
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import AdresseAutocomplete from './../../../utils/AdresseAutocomplete';


export default function TestAddAnnonce() {
  const [objects, setObjects] = useState([{ quantity: 1, item: "", dimension: "", weight: 0 }])
  const [advertisementPrice, setAdvertisementPrice] = useState(0)
  const [advertisementStatus, setAdvertisementStatus] = useState("en attente")
  const [file, setFile] = useState<File | null>(null)
  const [errorAdd, setErrorAdd] = useState<string | null>(null)
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [isPriority, setIsPriority] = useState(false)

  const [currentStreet, setcurrentStreet] = useState("")
  const [currentCity, setcurrentCity] = useState("")
  const [currentPostalCode, setcurrentPostalCode] = useState("")

  const [destinationStreet, setdestinationStreet] = useState("")
  const [destinationCity, setdestinationCity] = useState("")
  const [destinationPostalCode, setdestinationPostalCode] = useState("")

  const [advertisementBeginning, setadvertisementBeginning] = useState("")
  const [advertisementEnd, setadvertisementEnd] = useState("")

  const [additionalInformation, setAdditionalInformation] = useState("")
  const [userId, setUserId] = useState<number | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)
  const router = useRouter()

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Token manquant")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
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
      formData.append("photo", file)
      formData.append("additionalInformation", additionalInformation)
      formData.append("advertisementPrice", advertisementPrice.toString())
      formData.append("creatorRole", "chariot")
      formData.append("advertisementType", "chariot")

      formData.append("advertisementStatus", advertisementStatus)
      formData.append("advertisementBeginning", advertisementBeginning)
      formData.append("advertisementEnd", advertisementEnd)
      formData.append("isPriority", isPriority.toString())
      formData.append("photoName", file.name)
      formData.append("publicationDate", new Date().toISOString())
      formData.append("usersId", userId.toString())

      const packageData = objects.map((obj) => ({
        quantity: obj.quantity,
        item: obj.item,
        dimension: obj.dimension,
        weight: obj.weight,
        prioritaire: isPriority,
        localisations: [
          {
            currentStreet,
            currentCity,
            currentPostalCode: Number.parseInt(currentPostalCode) || 0,
            destinationStreet,
            destinationCity,
            destinationPostalCode: Number.parseInt(destinationPostalCode) || 0,
          },
        ],
      }))

      formData.append("packages", JSON.stringify(packageData))

      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const createdAd = await res.json()
      const adId = createdAd.id
      router.push(`/dashboard/shopkeeper/announcementsBoxe/${adId}`)
      if (!res.ok) throw new Error(await res.text())

      alert("Annonce ajoutée avec succès ✅")
    } catch (err: any) {
      setErrorAdd(err.message)
    } finally {
      setLoadingAdd(false)
    }
  }

  return (
  <div className="max-w-3xl mx-auto p-6 space-y-8">
    <h1 className="text-3xl font-bold text-center">Créer une annonce</h1>

    <form onSubmit={handleAddSubmit} className="space-y-8">
      <section className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block font-medium mb-1">Photo de l'annonce</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">Prix (€)</label>
          <input
            type="number"
            value={advertisementPrice}
            onChange={(e) => setAdvertisementPrice(+e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Informations complémentaires</label>
          <textarea
            placeholder="information complémentaire (max 350 characters)"
            value={additionalInformation}
            maxLength={350}
            onChange={(e) => setAdditionalInformation(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Date de début</label>
            <input
              type="date"
              value={advertisementBeginning}
              onChange={(e) => setadvertisementBeginning(e.target.value)}
              min={today}
              required
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Date de fin</label>
            <input
              type="date"
              value={advertisementEnd}
              onChange={(e) => setadvertisementEnd(e.target.value)}
              min={today}
              required
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Adresse de départ</h2>
        <AdresseAutocomplete
          label="Adresse de départ"
          query={currentStreet}
          onQueryChange={setcurrentStreet}
          onSelect={({ street, city, postalCode }) => {
            setcurrentStreet(street)
            setcurrentCity(city)
            setcurrentPostalCode(postalCode.toString())
          }}
        />
      </section>


      <section className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Adresse d'arrivée</h2>
        <AdresseAutocomplete
          label="Adresse d'arrivée"
          query={destinationStreet}
          onQueryChange={setdestinationStreet}
          onSelect={({ street, city, postalCode }) => {
            setdestinationStreet(street)
            setdestinationCity(city)
            setdestinationPostalCode(postalCode.toString())
          }}
        />
      </section>


      <section className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Objet(s)</h2>
        {objects.map((obj, idx) => (
          <div key={idx} className="border p-4 rounded-md bg-gray-50 space-y-2">
            <input
              placeholder="Nom (max 50 characters)"
              maxLength={50}
              value={obj.item}
              onChange={(e) => {
                const copy = [...objects]
                copy[idx].item = e.target.value
                setObjects(copy)
              }}
              required
              className="w-full border p-2 rounded"
            />
            <label>Quantité :</label>
            <input
              type="number"
              placeholder="Quantité"
              value={obj.quantity}
              onChange={(e) => {
                const copy = [...objects]
                copy[idx].quantity = +e.target.value
                setObjects(copy)
              }}
              required
              className="w-full border p-2 rounded"
            />
            <select
              value={obj.dimension}
              onChange={(e) => {
                const newObjects = [...objects]
                newObjects[idx].dimension = e.target.value
                setObjects(newObjects)
              }}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Sélectionner une taille</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
            <label>Poids (kg) :</label>
            <input
              type="number"
              step="0.01"
              placeholder="Poids"
              value={obj.weight}
              onChange={(e) => {
                const copy = [...objects]
                copy[idx].weight = +e.target.value
                setObjects(copy)
              }}
              required
              className="w-full border p-2 rounded"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setObjects([...objects, { quantity: 1, item: "", dimension: "", weight: 0 }])}
          className="text-blue-600 hover:underline text-sm"
        >
          + Ajouter un objet
        </button>
      </section>

      <div className="flex items-center gap-3">
        <label htmlFor="priority" className="font-medium">Annonce prioritaire :</label>
        <input
          id="priority"
          type="checkbox"
          checked={isPriority}
          onChange={(e) => setIsPriority(e.target.checked)}
          className="w-5 h-5"
        />
      </div>

      {errorAdd && <p className="text-red-600 font-medium">{errorAdd}</p>}

      <button
        type="submit"
        disabled={loadingAdd}
        className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
      >
        {loadingAdd ? "Création en cours..." : "Créer l'annonce"}
      </button>
    </form>
  </div>
)

}
