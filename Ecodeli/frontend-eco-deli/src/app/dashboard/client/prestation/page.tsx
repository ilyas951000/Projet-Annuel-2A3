'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

// ---- Interfaces ----
interface IProfile {
  id: number;
  prestationType: string;
  price: number;
  description: string;
  user: {
    id: number;
    userFirstName: string;
    userLastName: string;
  };
}

// ---- Modal réservation ----
function ReservationModal({
  providerId,
  clientId,
  prestationType,
  onClose,
}: {
  providerId: number;
  clientId: number;
  prestationType: string;
  onClose: () => void;
}) {
  const [prix, setPrix] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:3001/intervention', {
        prestataireId: providerId,
        clientId,
        type: prestationType,
        prix: parseFloat(prix),
        description: message,
      });
      if (res.status === 201 || res.status === 200) {
        setSuccess(true);
      } else {
        setError('Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 text-xl">&times;</button>
        <h2 className="text-xl font-semibold mb-4">Réserver cette prestation</h2>
        {success ? (
          <p className="text-green-600">✅ Demande envoyée avec succès.</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="block font-medium">Prix proposé (€)</label>
              <input
                type="number"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Message au prestataire</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border p-2 rounded w-full"
                rows={4}
              />
            </div>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {loading ? 'Envoi…' : 'Envoyer la demande'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ---- Page principale ----
export default function ListePrestataires() {
  const [profiles, setProfiles] = useState<IProfile[]>([]);
  const [clientId, setClientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<{
    providerId: number;
    prestationType: string;
  } | null>(null);

  // --- Fetch client ID ---
  useEffect(() => {
    const fetchClientId = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = await res.json();

        if (!res.ok || !userData.userId) {
          throw new Error('Utilisateur non valide.');
        }

        setClientId(userData.userId);
      } catch (err) {
        console.error('Erreur lors de la récupération du client connecté.');
      }
    };

    fetchClientId();
  }, []);

  // --- Fetch profils prestataires ---
  const fetchProfiles = (start?: string, end?: string) => {
    const token = localStorage.getItem('token');
    let url = 'http://localhost:3001/public-profile';
    if (start && end) {
      url = `http://localhost:3001/public-profile/available?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    }

    setLoading(true);
    setError(null);
    setRequestSent(true);

    axios
      .get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      .then((res) => {
        setProfiles(res.data);
      })
      .catch(() => {
        setError('Erreur lors du chargement des profils');
        setProfiles([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSearch = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setError('Veuillez renseigner les deux dates');
      return;
    }
    fetchProfiles(startDate, endDate);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Prestataires disponibles</h1>

      {/* Filtres de date */}
      <div className="mb-6 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block font-medium">Date de début</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Date de fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Rechercher
        </button>
      </div>

      {loading && <p>Chargement des prestataires…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && requestSent && profiles.length === 0 && (
        <p>Aucun prestataire disponible pour cette période.</p>
      )}

      {!loading && !requestSent && (
        <p className="text-yellow-600">
          ⚠️ Aucune requête n’a été envoyée au serveur.
        </p>
      )}

      {!loading && profiles.length > 0 && (
        <ul className="space-y-6">
          {profiles.map((profile) => (
            <li key={profile.id} className="p-4 border rounded bg-white shadow">
              <h2 className="text-xl font-semibold">
                {profile.user?.userFirstName} {profile.user?.userLastName}
              </h2>
              <p><strong>Prestation :</strong> {profile.prestationType}</p>
              <p><strong>Prix :</strong> {profile.price} €</p>
              <p><strong>Description :</strong> {profile.description}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/dashboard/client/profil-prestation/${profile.user.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Voir le profil complet
                </Link>

                {clientId && (
                  <Link
                    href={`/dashboard/client/chat/${profile.user.id}?from=${clientId}`}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Contacter le prestataire
                  </Link>
                )}


                <button
                  onClick={() =>
                    setSelectedReservation({
                      providerId: profile.user.id,
                      prestationType: profile.prestationType,
                    })
                  }
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  disabled={!clientId}
                >
                  Prendre une réservation
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedReservation && clientId && (
        <ReservationModal
          providerId={selectedReservation.providerId}
          clientId={clientId}
          prestationType={selectedReservation.prestationType}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
}
