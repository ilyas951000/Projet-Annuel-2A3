'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";



type Booking = {
  id: number;
  status: string;
  schedule: {
    scheduleStart: string;
    scheduleEnd: string;
  };
  client: {
    id: number;
    firstName: string;
    lastName: string;
  };
  package: {
    id: number;
    title: string;
    advertisementId: number;
  };
};

type Advertisement = {
  id: number;
  advertisementTitle: string;
  packages: { id: number }[];
};



export default function LivraisonEnAttente() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const [annonces, setAnnonces] = useState<Advertisement[]>([]);
  

  // Récupération des réservations du livreur
    
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const userId = res.data.userId;

        const resBookings = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/booking/courier/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const filtered = resBookings.data.filter((b: Booking) => b.status === 'en attente');
        setBookings(filtered);
      } catch (error) {
        console.error(error);
        setMessage("Erreur lors du chargement des réservations.");
      }
    };

    fetchBookings();
  }, []);

  

  // Trouver l’annonce correspondant à un package
  

  // Acceptation de la réservation
  const acceptBooking = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
        if (!token) {
        console.warn("Aucun token trouvé dans localStorage !");
        return;
        }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/booking/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(bookings.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'acceptation.");
    }
  };

  const groupedBookings = bookings.reduce((acc, booking) => {
    const adId = booking.package.advertisementId;
    if (!acc[adId]) {
        acc[adId] = [];
    }
    acc[adId].push(booking);
    return acc;
    }, {} as Record<number, Booking[]>);

  
    return (
    <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Réservations en attente</h2>
        {message && <p className="text-red-600">{message}</p>}
        {bookings.length === 0 && <p>Aucune réservation à valider.</p>}

        <ul className="space-y-4">
        {Object.entries(groupedBookings).map(([adId, group]) => (
            <li key={adId} className="border p-4 rounded shadow">
            <p className="text-lg font-semibold mb-2">Annonce #{adId}</p>

            {group.map((b) => (
                <div key={b.id} className="mb-4 border-b border-gray-200 pb-2">
                <p><strong>Colis :</strong> {b.package?.title ?? `#${b.package.id}`}</p>
                <p><strong>Client :</strong> {b.client.firstName} {b.client.lastName}</p>
                <p><strong>Début :</strong> {new Date(b.schedule.scheduleStart).toLocaleString()}</p>
                <p><strong>Fin :</strong> {new Date(b.schedule.scheduleEnd).toLocaleString()}</p>
                </div>
            ))}

            <div className="mt-4 flex flex-wrap gap-4">
                <button
                    onClick={async () => {
                        try {
                        const token = localStorage.getItem('token');
                        if (!token) return alert("Token manquant");

                        // Accepter tous les bookings liés à l'annonce
                        await Promise.all(
                            group.map((booking) =>
                            axios.patch(
                                `${process.env.NEXT_PUBLIC_API_URL}/booking/${booking.id}/accept`,
                                {},
                                { headers: { Authorization: `Bearer ${token}` } }
                            )
                            )
                        );

                        // Retirer du state les bookings acceptés
                        setBookings((prev) =>
                            prev.filter((b) => b.package.advertisementId !== Number(adId))
                        );
                        } catch (err) {
                        console.error(err);
                        alert("Erreur lors de l'acceptation de l'annonce.");
                        }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                    Accepter l'annonce
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          if (!token) return alert("Token manquant");

                          await Promise.all(
                            group.map((booking) =>
                              axios.patch(
                                `${process.env.NEXT_PUBLIC_API_URL}/booking/${booking.id}/refuse`,
                                {},
                                { headers: { Authorization: `Bearer ${token}` } }
                              )
                            )
                          );

                          setBookings((prev) =>
                            prev.filter((b) => b.package.advertisementId !== Number(adId))
                          );
                        } catch (err) {
                          console.error(err);
                          alert("Erreur lors du refus de l'annonce.");
                        }
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Refuser l'annonce
                    </button>


                <button
                onClick={() =>
                    router.push(`/dashboard/livreur/announcementPage/${adId}`)
                }
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                >
                Voir détail de l'annonce
                </button>
            </div>
            </li>
        ))}
        </ul>
    </div>
    );



}
