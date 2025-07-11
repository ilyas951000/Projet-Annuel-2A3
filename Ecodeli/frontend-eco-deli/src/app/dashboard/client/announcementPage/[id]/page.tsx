"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { MapPin, Calendar, Truck, Package ,X} from "lucide-react"

interface Localisation {
  currentStreet: string
  currentCity: string
  currentPostalCode: number
  destinationStreet: string
  destinationCity: string
  destinationPostalCode: number
}

interface PackageType {
  id: number
  packageName: string
  packageWeight: string
  packageQuantity: number
  packageDimension: string
  localisations: Localisation[]
}

interface Advertisement {
  id: number
  advertisementPhoto?: string
  publicationDate: string
  additionalInformation?: string
  advertisementPrice: number
  advertisementStatus: string
  advertisementBeginning: string
  advertisementEnd: string
  packages: PackageType[]
}

export default function AnnouncementPage() {
  const { id } = useParams()
  const [ad, setAd] = useState<Advertisement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)


  useEffect(() => {
    if (!id) return
    const fetchAd = async () => {
      try {
        const res = await fetch(`http://localhost:3001/advertisements/${id}`)
        if (!res.ok) throw new Error("Erreur de chargement")
        const data = await res.json()
        setAd(data)
      } catch (err: any) {
        setError(err.message || "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    }
    fetchAd()
  }, [id])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR")

  const getStatusStep = (status: string) => {
    const steps = ["en attente", "pris en charge", "en transit", "livré"]
    return steps.indexOf(status)
  }

  if (loading) return <div className="p-10">Chargement...</div>
  if (error || !ad) return <div className="p-10 text-red-600">Erreur : {error}</div>

  const pkg = ad.packages[0]
  const loc = pkg?.localisations[0]


  return (
    <div className="p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex items-start gap-6">
        <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-gray-100 shadow-md cursor-pointer"
            onClick={() => setLightboxOpen(true)}>
          {ad.advertisementPhoto && (
            <Image
              src={`http://localhost:3001/uploads/${ad.advertisementPhoto}`}
              alt="photo"
              fill
              className="object-cover"
            />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {pkg.packageName} (x{pkg.packageQuantity})
          </h1>
          <p className="text-sm text-gray-500">
            Colis #{ad.id} • Publié le {formatDate(ad.publicationDate)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            <MapPin className="inline w-4 h-4 mr-1" />
            {loc.currentCity} → {loc.destinationCity}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            <Calendar className="inline w-4 h-4 mr-1" />
            {formatDate(ad.advertisementBeginning)} – {formatDate(ad.advertisementEnd)}
          </p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
            {ad.advertisementStatus}
          </span>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex justify-between items-center">
        {["En attente", "Pris en charge", "En transit", "Livré"].map((step, idx) => (
          <div key={step} className="flex flex-col items-center w-full">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                idx <= getStatusStep(ad.advertisementStatus)
                  ? "bg-green-500 text-white border-green-500"
                  : "text-gray-400 border-gray-300"
              }`}
            >
              {idx + 1}
            </div>
            <p className="text-xs mt-2">{step}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {ad.packages.map((pkg) => (
          <div
            key={pkg.id}
            className="grid md:grid-cols-2 gap-6 border p-4 rounded-lg shadow-sm"
          >
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-500" />
                Détails du colis
              </h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong>Objet:</strong> {pkg.packageName}
                </p>
                <p>
                  <strong>Quantité:</strong> {pkg.packageQuantity}
                </p>
                <p>
                  <strong>Dimensions:</strong> {pkg.packageDimension}
                </p>
                <p>
                  <strong>Poids:</strong> {pkg.packageWeight} kg
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-blue-500" />
                Itinéraire de livraison
              </h2>
              <div className="space-y-4 text-sm text-gray-700">
                {pkg.localisations.map((loc, i) => (
                  <div key={i}>
                    <p className="font-medium text-green-600">Point de départ</p>
                    <p>
                      {loc.currentStreet}, {loc.currentCity} {loc.currentPostalCode}
                    </p>
                    <p className="font-medium text-blue-600 mt-2">Destination</p>
                    <p>
                      {loc.destinationStreet}, {loc.destinationCity} {loc.destinationPostalCode}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>


      {ad.additionalInformation && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Informations complémentaires</h2>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
            {ad.additionalInformation}
          </div>
        </div>
      )}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-red-400"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-[500px] bg-white rounded-xl overflow-hidden">
              <Image
                src={`http://localhost:3001/uploads/${ad.advertisementPhoto}`}
                alt="photo grand format"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
  
    </div>
    
    
  )
  
}
