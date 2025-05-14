"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ClientPackagePaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { packageId } = useParams();

  const [clientId, setClientId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Récupérer client + prix du colis (via l'annonce)
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Utilisateur non connecté.");
        return;
      }

      try {
        // 1. Récupérer le client connecté
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        if (!userRes.ok || !userData.userId) {
          throw new Error("Utilisateur non valide.");
        }
        setClientId(userData.userId);

        // 2. Récupérer le colis
        const packageRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const packageData = await packageRes.json();
        if (!packageRes.ok || !packageData.advertisementId) {
          throw new Error("Colis introuvable.");
        }

        // 3. Récupérer le prix dans l'annonce
        const adRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${packageData.advertisementId}`);
        const adData = await adRes.json();
        if (!adRes.ok || adData.advertisementPrice == null) {
          throw new Error("Prix de l'annonce introuvable.");
        }

        setAmount(parseFloat(adData.advertisementPrice));
      } catch (err: any) {
        setMessage(err.message || "Erreur inattendue.");
      }
    };

    fetchData();
  }, [packageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!stripe || !elements) {
      setMessage("Stripe non prêt.");
      return;
    }
    if (!clientId || !packageId || !amount) {
      setMessage("Informations incomplètes.");
      return;
    }

    setLoading(true);
    try {
      // 1. Créer le paiement Stripe
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          packageId,
          amount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.message || "Erreur lors de la création du paiement.");
      }

      // 2. Confirmer le paiement avec Stripe
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Champ carte introuvable.");

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card },
      });

      if (result.error) throw new Error(result.error.message!);

      if (result.paymentIntent?.status === "succeeded") {
        setMessage("✅ Paiement réussi !");
        elements.getElement(CardElement)?.clear();

        // 3. ✅ Marquer le colis comme payé dans la base
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}/paid`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (err: any) {
      setMessage(err.message || "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded shadow"
    >
      <h2 className="text-2xl font-bold mb-4">Paiement du colis #{packageId}</h2>

      <label className="block mb-4 text-sm">
        Montant (€)
        <input
          type="number"
          value={amount}
          readOnly
          className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
        />
      </label>

      <div className="mb-4">
        <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
      </div>

      <button
        type="submit"
        disabled={loading || !clientId}
        className="w-full bg-blue-600 text-white p-3 rounded disabled:opacity-50"
      >
        {loading ? "Paiement en cours…" : `Payer ${amount.toFixed(2)} €`}
      </button>

      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </form>
  );
}
