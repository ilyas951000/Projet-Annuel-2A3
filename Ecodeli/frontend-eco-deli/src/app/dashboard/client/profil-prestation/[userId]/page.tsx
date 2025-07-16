'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';



interface IProfile {
  id: number;
  prestationType: string;
  price: number;
  description: string;
  zoneIntervention?: string;
  disponibilites?: string;
  biographie?: string;
  langues?: string;
  delaiReponse?: string;
  tempsMoyenIntervention?: string;
}

interface IUser {
  id: number;
  userFirstName: string;
  userLastName: string;
}

interface IRate {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  client: {
    id: number;
    userFirstName: string;
    userLastName: string;
  };
}


export default function PublicProfileVitrine() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [rates, setRates] = useState<IRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const paginatedRates = rates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(rates.length / itemsPerPage)


  useEffect(() => {
    if (!userId) {
      setError('ID utilisateur manquant');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    // Fetch profile
    axios.get(`http://localhost:3001/public-profile/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProfile(res.data[0]);
        } else {
          setError('Profil introuvable');
        }
      })
      .catch(() => setError('Erreur lors du chargement du profil'))
      .finally(() => setLoading(false));

    // Fetch user info
    axios.get(`http://localhost:3001/users/${userId}`)
      .then(res => setUser(res.data))
      .catch(() => console.error('Impossible de charger les informations utilisateur'));

    // Fetch evaluations
    axios.get(`http://localhost:3001/rates/provider/${userId}`)
      .then(res => setRates(res.data))
      .catch(() => console.error('Impossible de charger les évaluations'));
  }, [userId]);

  const averageRating = rates.length
    ? (rates.reduce((sum, r) => sum + r.rating, 0) / rates.length).toFixed(1)
    : null;

  if (loading) return <p>Chargement du profil…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!profile) return null;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto bg-white rounded-2xl shadow-xl">
      <div className="border-b pb-6 mb-6">
        <h1 className="text-4xl font-bold text-green-700 mb-2">nom et prénom du prestataire: {" "} <br />
          {user ? `${user.userFirstName} ${user.userLastName}` : 'Prestataire'}
        </h1>
        <p className="text-gray-600">prestation: {profile.prestationType}</p>
      </div>

      <div className="space-y-4 text-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-semibold">Tarif :</span> {profile.price} €</p>
            {profile.zoneIntervention && (
              <p><span className="font-semibold">Zone d’intervention :</span> {profile.zoneIntervention}</p>
            )}
            {profile.disponibilites && (
              <p><span className="font-semibold">Disponibilités :</span> {profile.disponibilites}</p>
            )}
            {profile.delaiReponse && (
              <p><span className="font-semibold">Délai de réponse :</span> {profile.delaiReponse}</p>
            )}
            {profile.tempsMoyenIntervention && (
              <p><span className="font-semibold"> Temps moyen d’intervention :</span> {profile.tempsMoyenIntervention}</p>
            )}
          </div>
          <div>
            {profile.langues && (
              <p><span className="font-semibold"> Langues parlées :</span> {profile.langues}</p>
            )}
            {profile.biographie && (
              <p><span className="font-semibold"> Biographie :</span><br />
                <span className="text-gray-700">{profile.biographie}</span>
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="mt-4"><span className="font-semibold"> Description :</span></p>
          <p className="text-gray-700">{profile.description}</p>
        </div>
      </div>

      {/* Évaluations */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-green-700 mb-4"> Évaluations</h2>

        {averageRating && (
          <p className="mb-3 text-lg text-gray-800">
            Note moyenne : <span className="font-bold text-green-600">{averageRating}/5</span>
          </p>
        )}

        {rates.length === 0 ? (
          <p className="text-gray-500 italic">Aucune évaluation reçue pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {paginatedRates.map((rate) => (
              <div key={rate.id} className="bg-gray-50 border rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <div className="mb-2">
  <p className="text-sm text-gray-700">
    <span className="font-semibold"> Utilisateur :</span>{' '}
    {rate.client.userFirstName} {rate.client.userLastName}
  </p>
  <p className="text-xs text-gray-500">
    <span className="font-medium">ID :</span> {rate.client.id}
  </p>
</div>


                  <span className="text-yellow-500 font-semibold">⭐ {rate.rating}/5</span>
                </div>
                {rate.comment && <p className="italic text-gray-700">“{rate.comment}”</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(rate.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}

          </div>
        )}
        <div className="mt-8 flex justify-end">
          <a
            href={`/dashboard/client/note-prestataire/${userId}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Noter ce prestataire
          </a>
        </div>

      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-100 disabled:opacity-50"
          >
            Précédent
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-lg border text-sm ${
                currentPage === i + 1
                  ? 'bg-green-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-100 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}

    </div>
    
  )
}
