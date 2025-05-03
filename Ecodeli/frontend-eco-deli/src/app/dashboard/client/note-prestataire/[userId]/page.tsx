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
      .get('http://51.15.231.248:3001/auth/me', {
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
        'http://51.15.231.248:3001/rates',
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
      console.error('❌ Erreur d’envoi:', err.response?.data || err.message);
      setMessage('Erreur lors de l’envoi de la note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Noter ce prestataire</h1>

      {message && (
        <div className="mb-4 text-sm text-blue-700 font-medium">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Note</label>
          <select
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
            className="border rounded p-2 w-full"
            required
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>
                {n} étoile{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Commentaire</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="border rounded p-2 w-full"
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={!clientId || !token || isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}
