'use client';

import { useEffect, useState } from 'react';

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
  clientId?: number;
  transfer?: Transfer;
}

export default function MesDemandes() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [prestataireId, setPrestataireId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.userId) throw new Error('Utilisateur invalide');
        setPrestataireId(data.userId);

        const demandes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intervention/prestataire/${data.userId}`);
        const list = await demandes.json();
        setInterventions(list);
      } catch (err) {
        setError('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateStatut = async (id: number, statut: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intervention/${id}/statut`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut }),
    });

    // Refetch la liste à jour
    const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intervention/prestataire/${prestataireId}`);
    const data = await updated.json();
    setInterventions(data);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📥 Mes demandes reçues</h1>

      {loading && <p>Chargement…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && interventions.length === 0 && (
        <p>Aucune demande reçue.</p>
      )}

      <ul className="space-y-6">
        {interventions.map((d) => (
          <li key={d.id} className="p-4 border rounded bg-white shadow">
            <p><strong>Type :</strong> {d.type}</p>
            <p><strong>Client ID :</strong> {d.clientId ?? 'N/A'}</p>
            <p><strong>Prix proposé :</strong> {d.prix} €</p>
            <p><strong>Message :</strong> {d.commentaireClient || '—'}</p>
            <p><strong>Statut :</strong> <span className="uppercase">{d.statut}</span></p>
            <p className="text-sm text-gray-500 mt-1">
              Envoyé le {new Date(d.createdAt).toLocaleString()}
            </p>

            {/* Paiement visible si accepté */}
            {d.statut === 'accepte' && (
              <>
                {d.transfer?.status === 'completed' ? (
                  <p className="text-green-600 font-medium mt-2">✅ Client a payé</p>
                ) : (
                  <p className="text-orange-600 font-medium mt-2">⏳ En attente de paiement</p>
                )}
              </>
            )}

            {d.statut === 'en_attente' && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => updateStatut(d.id, 'accepte')}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Accepter
                </button>
                <button
                  onClick={() => updateStatut(d.id, 'refuse')}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                >
                  Refuser
                </button>
                <button
                  onClick={() => updateStatut(d.id, 'negociation')}
                  className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
                >
                  Négocier
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
