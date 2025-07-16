"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import AdresseAutocomplete from './../../../utils/AdresseAutocomplete';

interface IMovement {
  id: number
  originStreet: string
  originCity: string
  originPostalCode: number
  destinationStreet: string
  destinationCity: string
  destinationPostalCode: number
  active: boolean
}

export default function MovementsPage() {
  const [mounted, setMounted] = useState(false)
  const [livreurId, setLivreurId] = useState<number | null>(null)
  const [movements, setMovements] = useState<IMovement[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [originQuery, setOriginQuery] = useState("")
  const [destinationQuery, setDestinationQuery] = useState("")
  const [movementHistory, setMovementHistory] = useState<IMovement[]>([])
  const [currentPageHistory, setCurrentPageHistory] = useState(1)
  const itemsPerPage = 2



  const [form, setForm] = useState({
    originStreet: "",
    originCity: "",
    originPostalCode: "",
    destinationStreet: "",
    destinationCity: "",
    destinationPostalCode: "",
  })

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem("token")
    if (!token) {
      setError("Token manquant")
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setLivreurId(res.data.userId)
      } catch (err) {
        setError("Erreur récupération utilisateur")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    if (livreurId) {
      fetchMovements()
      fetchMovementHistory()
    }
  }, [livreurId])


  const fetchMovements = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/movements/user/${livreurId}`)
      setMovements(res.data)
    } catch (err) {
      setError("Erreur chargement des trajets")
    }
  }
  const fetchMovementHistory = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/movements/user/${livreurId}/history`)
      setMovementHistory(res.data)
    } catch (err) {
      console.error("Erreur chargement de l'historique des trajets")
    }
  }


  const handleDeactivate = async (id: number) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/movements/${id}/deactivate`)
      fetchMovements()
    } catch (err) {
      alert("Erreur lors de la désactivation du trajet")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!livreurId) return

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/movements`, {
        userId: livreurId,
        ...form,
        originPostalCode: Number.parseInt(form.originPostalCode, 10),
        destinationPostalCode: Number.parseInt(form.destinationPostalCode, 10),
      })
      setForm({
        originStreet: "",
        originCity: "",
        originPostalCode: "",
        destinationStreet: "",
        destinationCity: "",
        destinationPostalCode: "",
      })
      fetchMovements()
    } catch (err) {
      alert("Erreur lors de l'ajout du trajet")
    }
  }
  const indexOfLast = currentPageHistory * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentHistory = movementHistory.slice(indexOfFirst, indexOfLast)

  const totalPages = Math.ceil(movementHistory.length / itemsPerPage)


  if (!mounted) return null

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mes Trajets</h1>
        <p className="text-gray-500">Ajoutez et gérez vos trajets pour trouver des colis sur votre route</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <h3 className="font-medium">Erreur</h3>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="inline-block w-8 h-8 bg-blue-100 rounded-full text-blue-600 flex items-center justify-center mr-2">
                +
              </span>
              Ajouter un Trajet
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset className="border border-gray-200 p-4 rounded-md bg-gray-50">
                <AdresseAutocomplete
                  label="Adresse de départ"
                  query={originQuery}
                  onQueryChange={setOriginQuery}
                  onSelect={({ street, city, postalCode }) =>
                    setForm((prev) => ({
                      ...prev,
                      originStreet: street,
                      originCity: city,
                      originPostalCode: postalCode,
                    }))
                  }
                />

              </fieldset>

              <fieldset className="border border-gray-200 p-4 rounded-md bg-gray-50">
                <AdresseAutocomplete
                  label="Adresse d’arrivée"
                  query={destinationQuery}
                  onQueryChange={setDestinationQuery}
                  onSelect={({ street, city, postalCode }) =>
                    setForm((prev) => ({
                      ...prev,
                      destinationStreet: street,
                      destinationCity: city,
                      destinationPostalCode: postalCode,
                    }))
                  }
                />
              </fieldset>

              <button
                type="submit"
                disabled={movements.length > 0}
                className={`w-full px-4 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
                  ${movements.length > 0 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                  }`}
              >
                {movements.length > 0 ? "Un trajet est déjà actif" : "Ajouter ce trajet"}
              </button>

            </form>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="inline-block w-8 h-8 bg-green-100 rounded-full text-green-600 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                Trajets Actifs
              </h2>

              {movements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">Aucun trajet actif</p>
                  <p className="text-sm">Ajoutez un trajet pour trouver des colis sur votre route</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {movements.map((m) => (
                    <li
                      key={m.id}
                      className="border border-gray-200 p-4 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors relative"
                    >
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-start">
                          <div className="bg-blue-100 text-blue-600 rounded-full p-1.5 mr-3 flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">Départ</p>
                            <p className="text-gray-600 text-sm">
                              {m.originStreet}, {m.originPostalCode} {m.originCity}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="bg-green-100 text-green-600 rounded-full p-1.5 mr-3 flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">Arrivée</p>
                            <p className="text-gray-600 text-sm">
                              {m.destinationStreet}, {m.destinationPostalCode} {m.destinationCity}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-200 flex justify-end">
                        <button
                          onClick={() => handleDeactivate(m.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Désactiver
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                
              )}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mt-8">
  <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
    <span className="inline-block w-8 h-8 bg-gray-200 rounded-full text-gray-600 flex items-center justify-center mr-2">
      🕘
    </span>
    Historique des Trajets
  </h2>

  {movementHistory.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      <p>Aucun trajet passé trouvé</p>
    </div>
  ) : (
    <ul className="space-y-3">
      {currentHistory.map((m) => (
        <li key={m.id} className="border border-gray-200 p-4 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="text-sm text-gray-700">
            <p><strong>Départ :</strong> {m.originStreet}, {m.originPostalCode} {m.originCity}</p>
            <p><strong>Arrivée :</strong> {m.destinationStreet}, {m.destinationPostalCode} {m.destinationCity}</p>
          </div>
        </li>
      ))}
      <div className="flex justify-center mt-4 space-x-2">
  <button
    disabled={currentPageHistory === 1}
    onClick={() => setCurrentPageHistory((prev) => Math.max(prev - 1, 1))}
    className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
  >
    Précédent
  </button>
  <span className="px-2 py-1 text-sm text-gray-600">
    Page {currentPageHistory} / {totalPages}
  </span>
  <button
    disabled={currentPageHistory === totalPages}
    onClick={() => setCurrentPageHistory((prev) => Math.min(prev + 1, totalPages))}
    className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
  >
    Suivant
  </button>
</div>

    </ul>
    

  )}
</div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
