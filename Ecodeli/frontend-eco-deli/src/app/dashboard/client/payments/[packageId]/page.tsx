"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { CreditCard, CheckCircle, AlertCircle, Package, ArrowLeft, Lock, ShieldCheck, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function ClientPackagePaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { packageId } = useParams()
  const router = useRouter()

  const [clientId, setClientId] = useState<number | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [message, setMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [packageInfo, setPackageInfo] = useState<any>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Récupérer client + prix du colis (via l'annonce)
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setMessage("Utilisateur non connecté.")
        return
      }

      try {
        // 1. Récupérer le client connecté
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const userData = await userRes.json()
        if (!userRes.ok || !userData.userId) {
          throw new Error("Utilisateur non valide.")
        }
        setClientId(userData.userId)

        // 2. Récupérer le colis
        const packageRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const packageData = await packageRes.json()
        if (!packageRes.ok || !packageData.advertisementId) {
          throw new Error("Colis introuvable.")
        }
        setPackageInfo(packageData)

        // 3. Récupérer le prix dans l'annonce
        const adRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${packageData.advertisementId}`)
        const adData = await adRes.json()
        if (!adRes.ok || adData.advertisementPrice == null) {
          throw new Error("Prix de l'annonce introuvable.")
        }

        setAmount(Number.parseFloat(adData.advertisementPrice))
      } catch (err: any) {
        setError(err.message || "Erreur inattendue.")
      }
    }

    fetchData()
  }, [packageId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError(null)

    if (!stripe || !elements) {
      setError("Stripe non prêt.")
      return
    }
    if (!clientId || !packageId || !amount) {
      setError("Informations incomplètes.")
      return
    }

    setLoading(true)
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
      })

      const data = await res.json()
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.message || "Erreur lors de la création du paiement.")
      }

      // 2. Confirmer le paiement avec Stripe
      const card = elements.getElement(CardElement)
      if (!card) throw new Error("Champ carte introuvable.")

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card },
      })

      if (result.error) throw new Error(result.error.message!)

      if (result.paymentIntent?.status === "succeeded") {
        setSuccess(true)
        elements.getElement(CardElement)?.clear()

        // 3. ✅ Marquer le colis comme payé dans la base
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}/paid`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        })

        // Rediriger après 3 secondes
        setTimeout(() => {
          router.push("/dashboard/client")
        }, 3000)
      }
    } catch (err: any) {
      setError(err.message || "Erreur inattendue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/client/colis-a-payer"
          className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour aux colis à payer
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center">
            <CreditCard className="w-6 h-6 mr-3" />
            Paiement du colis #{packageId}
          </h1>
          <p className="mt-2 text-green-100">Complétez votre paiement pour finaliser l'envoi de votre colis.</p>
        </div>

        <div className="p-6">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Paiement réussi !</h2>
              <p className="text-gray-600 mb-6">
                Votre paiement a été traité avec succès. Vous allez être redirigé vers votre tableau de bord.
              </p>
              <Link
                href="/dashboard/client"
                className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Retour au tableau de bord
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-start">
                <Package className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Détails du colis</h3>
                  <p className="text-gray-600 text-sm">
                    {packageInfo?.packageName || `Colis #${packageId}`}
                    {packageInfo?.packageWeight && ` - ${packageInfo.packageWeight} kg`}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant à payer</label>
                <div className="relative">
                  <input
                    type="text"
                    value={`${amount.toFixed(2)} €`}
                    readOnly
                    className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 cursor-not-allowed font-medium text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Informations de carte</label>
                <div className="border border-gray-300 p-3 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          "::placeholder": {
                            color: "#aab7c4",
                          },
                        },
                        invalid: {
                          color: "#9e2146",
                        },
                      },
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <Lock className="w-3 h-3 mr-1" />
                  Vos informations de paiement sont sécurisées
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-green-500 mr-2" />
                  Paiement sécurisé via Stripe
                </div>
                <button
                  type="submit"
                  disabled={loading || !stripe || !clientId}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-70 flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payer {amount.toFixed(2)} €
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
