'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface IProfile {
  id: number;
  price: number;
  description: string;
  zoneIntervention?: string;
  disponibilites?: string;
  biographie?: string;
  langues?: string;
  delaiReponse?: string;
  tempsMoyenIntervention?: string;
  prestationType: string;
}


export default function ProfilPrestataire() {
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [zoneIntervention, setZoneIntervention] = useState('');
  const [disponibilites, setDisponibilites] = useState('');
  const [biographie, setBiographie] = useState('');
  const [langues, setLangues] = useState('');
  const [delaiReponse, setDelaiReponse] = useState('');
  const [tempsMoyenIntervention, setTempsMoyenIntervention] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  // Récupération de l'userId
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token manquant');
      setLoading(false);
      return;
    }
    axios.get('http://localhost:3001/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUserId(r.data.userId))
      .catch(e => setError('Impossible de récupérer l’utilisateur'))
      .finally(() => setLoading(false));
  }, []);

  // Récupération du profil existant
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const token = localStorage.getItem('token')!;
    axios.get(`http://localhost:3001/public-profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      if (res.data.length) {
        const p: IProfile = res.data[0];
        setProfile(p);
        setPrice(p.price);
        setDescription(p.description);
        setZoneIntervention(p.zoneIntervention || '');
        setDisponibilites(p.disponibilites || '');
        setBiographie(p.biographie || '');
        setLangues(p.langues || '');
        setDelaiReponse(p.delaiReponse || '');
        setTempsMoyenIntervention(p.tempsMoyenIntervention || '');
      }
    })
    .catch(() => setError('Impossible de charger le profil'))
    .finally(() => setLoading(false));
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const token = localStorage.getItem('token')!;
    const payload = {
       price, description,
      zoneIntervention, disponibilites, biographie,
      langues, delaiReponse, tempsMoyenIntervention,
    };

    try {
      if (profile) {
        await axios.put(
          `http://localhost:3001/public-profile/${profile.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Profil mis à jour');
      } else {
        await axios.post(
          `http://localhost:3001/public-profile/${userId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Profil créé');
      }
      router.refresh();
      
    } catch {
      alert('Erreur lors de la sauvegarde');
    }
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Mon Profil Prestataire</h1>
        {profile?.prestationType && (
          <p className="text-center text-gray-700 mb-4">
            <span className="font-medium">Mon Activité : </span>
            {profile.prestationType}
          </p>
        )}


        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          {/* Type de prestation */}
          

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(+e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description courte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description courte</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Zone d’intervention */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zone d’intervention</label>
            <input
              type="text"
              value={zoneIntervention}
              onChange={e => setZoneIntervention(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Disponibilités */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilités</label>
            <textarea
              value={disponibilites}
              onChange={e => setDisponibilites(e.target.value)}
              rows={3}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Biographie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
            <textarea
              value={biographie}
              onChange={e => setBiographie(e.target.value)}
              rows={4}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Langues parlées */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Langues parlées</label>
            <input
              type="text"
              placeholder="Ex : français, anglais"
              value={langues}
              onChange={e => setLangues(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Délai de réponse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Délai de réponse</label>
            <input
              type="text"
              placeholder="Ex : 24h, 2h"
              value={delaiReponse}
              onChange={e => setDelaiReponse(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Temps moyen d’intervention */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temps moyen d’intervention</label>
            <input
              type="text"
              placeholder="Ex : 1h30"
              value={tempsMoyenIntervention}
              onChange={e => setTempsMoyenIntervention(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition"
          >
            {profile ? 'Mettre à jour' : 'Créer le profil'}
          </button>
        </form>
      </div>
    </div>
  );

}
