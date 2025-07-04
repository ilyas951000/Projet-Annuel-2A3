"use client"

import { useEffect, useState } from "react"
import { Package, MapPin, Truck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  packageDimension: string
  isPaid: boolean
}


interface AdvertisementType {
  id: number
  advertisementPrice: number
  isPaid: boolean
  packages: PackageType[]
}

export default function ClientPackagesPage() {
  const [packages, setPackages] = useState<PackageType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const Router = useRouter()

  useEffect(() => {
    const fetchPackages = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Utilisateur non connecté.")
        setLoading(false)
        return
      }

      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const user = await userRes.json()
        if (!userRes.ok || !user.userId) throw new Error("Utilisateur non valide.")

        const pkgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/client/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await pkgRes.json()
        if (!pkgRes.ok) throw new Error(data.message || "Erreur lors du chargement des colis.")

        const unpaid = data.filter((p: PackageType) => !p.isPaid)
        setPackages(unpaid)
      } catch (err: any) {
        setError(err.message || "Erreur inattendue.")
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-4xl mx-auto mt-6">
        <p className="flex items-center">
          <span className="mr-2">⚠️</span>
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          <span className="text-black">Eco</span>
          <span className="text-green-500">Deli</span> - Annonce à payer
        </h1>
        <p className="text-gray-600 mt-2">Finalisez le paiement de vos Annonces pour terminer la livraison</p>
      </div>

      {packages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune Annonce en attente de paiement</h3>
          <p className="text-gray-500">Tous vos Annonces ont été payés ou vous n'avez pas encore de colis.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {packages.map((ad) => (
            <div key={ad.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Annonce #{ad.id}</h2>
                  <p className="text-sm text-gray-500 mb-2">Prix : {ad.advertisementPrice} €</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    💳 Paiement requis
                  </span>
                </div>

                <div className="space-y-6">
                  {ad.packages.map((pkg) => (
                    <div key={pkg.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Package className="w-4 h-4 mr-2 text-green-500" />
                        Colis : {pkg.packageName}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-500 text-sm">Poids:</span>
                          <p className="font-medium">{pkg.packageWeight} kg</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Dimensions:</span>
                          <p className="font-medium">{pkg.packageDimension}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => Router.push(`/dashboard/client/announcementPage/${ad.id}`)}
                    className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Voir détail
                  </button>
                  <Link
                    href={`/dashboard/client/payments/${ad.id}`}
                    className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    <span className="mr-2">💳</span>
                    Procéder au paiement
                  </Link>
                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  )
}
