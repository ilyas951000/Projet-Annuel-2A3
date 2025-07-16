'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

export default function RateProviderPage() {
  const { userId } = useParams(); // <-- Correct param name (was "id")
  const [clientId, setClientId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Token depuis localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log('🔐 Token depuis localStorage:', storedToken);
    setToken(storedToken);
  }, []);

  // Récupération de l'utilisateur connecté
  useEffect(() => {
    if (!token) return;

    axios
      .get('http://localhost:3001/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        console.log('✅ /auth/me:', res.data);
        if (res.data?.userId) {
          setClientId(res.data.userId);
        } else {
          setMessage("ID utilisateur introuvable dans la réponse.");
        }
      })
      .catch(err => {
        console.error('❌ Erreur /auth/me:', err);
        setMessage("Erreur lors de la récupération de l'utilisateur.");
      });
  }, [token]);

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 Soumission...');
    console.log('➡️ Token:', token);
    console.log('➡️ Client ID:', clientId);
    console.log('➡️ Provider ID:', userId);

    if (!token || !clientId || !userId) {
      setMessage('❌ Informations manquantes pour envoyer la note.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:3001/rates',
        {
          rating,
          comment,
          clientId,
          providerId: parseInt(userId as string),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Note envoyée !', response.data);
      setMessage('Évaluation envoyée avec succès !');
      setRating(5);
      setComment('');
    } catch (err: any) {
      console.error('Erreur d’envoi:', err.response?.data || err.message);
      setMessage('Erreur lors de l’envoi de la note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">Noter ce prestataire</h1>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
            message.includes('succès')
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Note */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <span>Note attribuée</span>
          </label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} étoile{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Commentaire */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
            Votre commentaire (optionnel)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Exprimez votre retour d'expérience..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={5}
          />
        </div>

        {/* Bouton de soumission */}
        <div className="text-end">
          <button
            type="submit"
            disabled={!clientId || !token || isSubmitting}
            className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer l’évaluation'}
          </button>
        </div>
      </form>
    </div>
  );

}
