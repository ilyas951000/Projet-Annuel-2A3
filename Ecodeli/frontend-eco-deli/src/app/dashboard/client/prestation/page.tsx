'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

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

export default function ListePrestataires() {
  const [profiles, setProfiles] = useState<IProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const fetchProfiles = (start?: string, end?: string) => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    let url = 'http://localhost:3001/public-profile';
    if (start && end) {
      url = `http://localhost:3001/public-profile/available?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    }

    console.log('Fetching URL:', url);

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
          ⚠️ Aucune requête n’a été envoyée au serveur. Il se peut qu’un blocage empêche la récupération des données.
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

                <button
                  onClick={() => alert(`Contacter le prestataire ID: ${profile.user.id}`)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Contacter le prestataire
                </button>

                <button
                  onClick={() => alert(`Réserver avec le prestataire ID: ${profile.user.id}`)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Prendre une réservation
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
