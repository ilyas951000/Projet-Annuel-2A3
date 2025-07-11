"use client"

import { useEffect, useState } from "react"
import { Package, MapPin, Truck } from "lucide-react"
import Link from "next/link"

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
  packageWeight: number
  packageDimension: string
  packageDescription?: string
  packageRequirements?: string
  isPaid: boolean
  localisations?: Localisation[]
  advertisementId: number 
}

export default function ClientPackagesPage() {
  const [packages, setPackages] = useState<PackageType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

        const pkgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/client/${user.userId}`, {
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
          <span className="text-green-500">Deli</span> - Colis à payer
        </h1>
        <p className="text-gray-600 mt-2">Finalisez le paiement de vos colis pour commencer la livraison</p>
      </div>

      {packages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun colis en attente de paiement</h3>
          <p className="text-gray-500">Tous vos colis ont été payés ou vous n'avez pas encore de colis.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(
            packages.reduce((acc, pkg) => {
              if (!acc.has(pkg.advertisementId)) {
                acc.set(pkg.advertisementId, []);
              }
              acc.get(pkg.advertisementId)!.push(pkg);
              return acc;
            }, new Map<number, PackageType[]>())
          ).map(([advertisementId, pkgGroup]) => {
            const firstLoc = pkgGroup[0].localisations?.[0];

            return (
              <div key={advertisementId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Package className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Annonce #{advertisementId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        💳 Paiement requis
                      </span>
                    </div>
                  </div>

                  <div className={`grid grid-cols-1 ${firstLoc ? "lg:grid-cols-2" : ""} gap-8`}>
                    {/* Détails de TOUS les colis dans l'annonce */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Package className="w-4 h-4 mr-2 text-green-500" />
                        Colis dans cette annonce
                      </h4>
                      <div className="space-y-4">
                        {pkgGroup.map((pkg) => (
                          <div key={pkg.id} className="bg-gray-50 p-4 rounded-lg space-y-2 border">
                            <p className="text-gray-700 font-semibold">Colis #{pkg.id} – {pkg.packageName}</p>
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

                            {pkg.packageDescription && (
                              <div>
                                <span className="text-gray-500 text-sm">Description:</span>
                                <p className="text-sm text-gray-800">{pkg.packageDescription}</p>
                              </div>
                            )}

                            {pkg.packageRequirements && (
                              <div>
                                <span className="text-gray-500 text-sm">Exigences:</span>
                                <p className="text-sm text-gray-800">{pkg.packageRequirements}</p>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* ✅ Bouton unique en dehors de la boucle */}
                        <div className="mt-6 flex justify-end">
                          <Link
                            href={`/dashboard/client/payments/${pkgGroup[0].advertisementId}`}
                            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                          >
                            <span className="mr-2">💳</span>
                            Payer ce colis
                          </Link>
                        </div>

                      </div>
                    </div>

                    {/* Itinéraire commun à l’annonce */}
                    {firstLoc && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                          <Truck className="w-4 h-4 mr-2 text-green-500" />
                          Itinéraire de livraison
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                              <MapPin className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Point de départ</p>
                              <p className="text-gray-600 text-sm">
                                {firstLoc.currentStreet}
                                <br />
                                {firstLoc.currentCity} {firstLoc.currentPostalCode}
                              </p>
                            </div>
                          </div>

                          <div className="ml-5 border-l-2 border-dashed border-gray-300 h-6"></div>

                          <div className="flex items-start">
                            <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Destination</p>
                              <p className="text-gray-600 text-sm">
                                {firstLoc.destinationStreet}
                                <br />
                                {firstLoc.destinationCity} {firstLoc.destinationPostalCode}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      )}
    </div>
  )
}
