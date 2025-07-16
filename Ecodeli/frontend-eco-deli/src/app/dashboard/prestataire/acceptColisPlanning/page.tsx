'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

type BookingPrestataire = {
  id: number
  status: string
  schedule: {
    scheduleStart: string
    scheduleEnd: string
  }
  client: {
    id: number
    firstName: string
    lastName: string
  }
}

export default function ReservationsPrestataire() {
  const [bookings, setBookings] = useState<BookingPrestataire[]>([])
  const [message, setMessage] = useState('')
  const [providerId, setProviderId] = useState<number | null>(null)


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const me = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const providerId = me.data.userId

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/booking-prestataire/provider/${providerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        setProviderId(providerId)
        setBookings(res.data)
      } catch (err) {
        console.error(err)
        setMessage("Erreur lors du chargement des réservations.")
      }
    }

    fetchData()
  }, [])

  const handleAction = async (id: number, action: 'accept' | 'refuse') => {
    try {
        const token = localStorage.getItem('token')
        const selectedBooking = bookings.find(b => b.id === id)
        if (!selectedBooking) throw new Error('Réservation introuvable')

        // PATCH accept/refuse
        await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/booking-prestataire/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
        )

        // ✅ Si acceptée, on crée une intervention
        if (action === 'accept') {
  // 1. Récupération du profil public du prestataire
  const profileRes = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/public-profile/${providerId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )

  const publicProfile = profileRes.data?.[0] // on prend le premier s’il y en a plusieurs

  // 2. Création de l’intervention avec les infos du profil public
        await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/intervention`,
        {
            prestataireId: providerId, // ✅ IMPORTANT
            clientId: selectedBooking.client.id,
            type: publicProfile?.prestationType || 'Type non spécifié',
            description: publicProfile?.description || `Intervention liée à la réservation ${id}`,
            date: selectedBooking.schedule.scheduleStart,
            prix: publicProfile?.price || 0,
        },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
        )

}


        // Supprimer la réservation de la liste
        setBookings((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
        console.error(err)
        alert(`Erreur lors de la ${action === 'accept' ? 'validation' : 'refus'} de la réservation.`)
    }
    }


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Réservations en attente</h2>
      {message && <p className="text-red-600">{message}</p>}
      {bookings.length === 0 && <p>Aucune réservation à valider.</p>}

      <ul className="space-y-4">
        {bookings.map((b) => (
          <li key={b.id} className="border p-4 rounded shadow">
            <p><strong>Client :</strong> {b.client.firstName} {b.client.lastName}</p>
            <p><strong>Début :</strong> {new Date(b.schedule.scheduleStart).toLocaleString()}</p>
            <p><strong>Fin :</strong> {new Date(b.schedule.scheduleEnd).toLocaleString()}</p>

            <div className="mt-4 flex gap-4">
              <button
                onClick={() => handleAction(b.id, 'accept')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Accepter
              </button>
              <button
                onClick={() => handleAction(b.id, 'refuse')}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Refuser
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
