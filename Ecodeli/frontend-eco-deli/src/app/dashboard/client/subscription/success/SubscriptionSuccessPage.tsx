// app/dashboard/client/subscription/success/SubscriptionSuccessPage.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [confirmed, setConfirmed] = useState<boolean | null>(null);

  useEffect(() => {
    if (sessionId) {
      console.log('✔️ Paiement réussi – Session ID :', sessionId);

      // ✅ Appel vers le backend pour confirmer l'abonnement
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/confirm-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('✅ Abonnement confirmé côté backend :', data);
          setConfirmed(true);
        })
        .catch(err => {
          console.error('❌ Erreur confirmation abonnement :', err);
          setConfirmed(false);
        });
    }
  }, [sessionId]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Paiement réussi 🎉</h1>
      <p className="mt-4">Merci pour votre abonnement.</p>

      {sessionId && (
        <p className="mt-2 text-sm text-gray-500">Session ID : {sessionId}</p>
      )}

      {confirmed === true && (
        <p className="mt-2 text-green-600">✅ Abonnement confirmé avec succès</p>
      )}

      {confirmed === false && (
        <p className="mt-2 text-red-600">❌ Erreur lors de la confirmation de l’abonnement</p>
      )}
    </main>
  );
}
