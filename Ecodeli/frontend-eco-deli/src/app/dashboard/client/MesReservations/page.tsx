'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Transfer {
  status: 'pending' | 'completed' | 'failed' | 'paid';
  isValidatedByClient: boolean;
}

interface Intervention {
  id: number;
  type: string;
  prix: number;
  commentaireClient?: string;
  statut: string;
  createdAt: string;
  prestataireId: number;
  transfer?: Transfer;
}

export default function MesReservations() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [clientId, setClientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Utilisateur non connecté');
        setLoading(false);
        return;
      }

      try {
        // ✅ 1. Récupérer l'utilisateur
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();

        if (!userRes.ok || !userData.userId) {
          throw new Error('Utilisateur non valide.');
        }

        setClientId(userData.userId);

        // ✅ 2. Récupérer les interventions du client
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intervention/client/${userData.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setInterventions(data);
      } catch (err) {
        setError('Erreur lors du chargement des réservations.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📋 Mes réservations</h1>

      {loading && <p>Chargement…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && interventions.length === 0 && (
        <p>Vous n’avez encore effectué aucune demande.</p>
      )}

      <ul className="space-y-6">
        {interventions.map((i) => (
          <li key={i.id} className="p-4 border rounded bg-white shadow">
            <p><strong>Type :</strong> {i.type}</p>
            <p><strong>Prestataire ID :</strong> {i.prestataireId}</p>
            <p><strong>Prix proposé :</strong> {i.prix} €</p>
            <p><strong>Votre message :</strong> {i.commentaireClient || '—'}</p>
            <p><strong>Statut :</strong> <span className="uppercase">{i.statut}</span></p>
            <p className="text-sm text-gray-500 mt-1">
              Envoyé le {new Date(i.createdAt).toLocaleString()}
            </p>

            {i.statut === 'accepte' && i.transfer?.status !== 'completed' && (
              <button
                onClick={() => router.push(`paiementIntervention/${i.id}`)}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                💳 Payer maintenant
              </button>
            )}

            {i.statut === 'accepte' && i.transfer?.status === 'completed' && (
              <p className="text-green-700 font-medium mt-2">✅ Réservation payée</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
