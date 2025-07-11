"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Package,
  ArrowLeft,
  Lock,
  ShieldCheck,
  Loader2,
} from "lucide-react"
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

interface Package {
  id: number;
  packageName: string;
  packageWeight: number;
  packageDimension: string;
  prioritaire?: boolean;
}


function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const params = useParams();
  const router = useRouter()
  console.log("🧩 useParams() ->", params);
  const packageId = params.advertisementId;
  const advertisementId = params.advertisementId;
  const [supplement3000, setSupplement3000] = useState(0)

  const [subscription, setSubscription] = useState<any>(null)
  const [discountedFee, setDiscountedFee] = useState<number>(0)
  const [clientId, setClientId] = useState<number | null>(null)
  const [providerId, setProviderId] = useState<number | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [baseAmount, setBaseAmount] = useState<number>(0)
  const [fee, setFee] = useState<number>(0)
  const [message, setMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [packageInfo, setPackageInfo] = useState<Package[] | null>(null)

  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [freeShippingActivated, setFreeShippingActivated] = useState(false)
  const [discount, setDiscount] = useState<number>(0)
  const [hasPriorityFee, setHasPriorityFee] = useState(false)
  const [remainingFreePriority, setRemainingFreePriority] = useState<number | null>(null)
  const isPriority = packageInfo?.some(pkg => pkg.prioritaire)
  const [firstPackageId, setFirstPackageId] = useState<number | null>(null);

  const [subtotal, setSubtotal] = useState<number>(0);
  const [prioritySurcharge, setPrioritySurcharge] = useState<number>(0);

  const [baseReduction, setBaseReduction] = useState<number>(0);
  const [feeReduction, setFeeReduction] = useState<number>(0);
  const [extraDiscount, setExtraDiscount] = useState<number>(0);
  const [bigPackageFee, setBigPackageFee] = useState<number>(0);
  const [priorityFee, setPriorityFee] = useState<number>(0);




  
  const priorityPercent =
  !subscription?.subscriptionTitle || subscription.subscriptionTitle === "Free"
    ? 15
    : subscription.subscriptionTitle === "Premium"
    ? 5
    : subscription.subscriptionTitle === "Starter"
    ? 5
    : 0;





  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setMessage("Utilisateur non connecté.")
        console.warn("⚠️ Token manquant dans localStorage")
        return
      }

      try {
        
        console.log("📦 advertisementId récupéré depuis useParams:", packageId)

        // 1. Utilisateur
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const userData = await userRes.json()
        if (!userRes.ok || !userData.userId) throw new Error("Utilisateur non valide.")
        setClientId(userData.userId)

        // 2. Abonnement
        const subRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/user/${userData.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const subData = await subRes.json()
        if (subRes.ok) setSubscription(subData)
          console.log('📥 Response status:', subRes.status);

        // 3. Annonce (avec tous les colis)
        const adRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${advertisementId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const adData = await adRes.json()
        if (!adRes.ok || !adData.packages || !Array.isArray(adData.packages)) {
          throw new Error("Annonce ou colis introuvables.")
        }
        

        

        setPackageInfo(adData.packages)

        const base = parseFloat(adData.advertisementPrice)
        


        // 4. Livreur (via le premier colis de l’annonce)
        const firstPackageId = adData.packages[0]?.id
        setFirstPackageId(firstPackageId);
        const delivererRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${firstPackageId}/deliverer`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const delivererData = await delivererRes.json()
        if (!delivererRes.ok || !delivererData.userId) throw new Error("Livreur introuvable.")
        setProviderId(delivererData.userId)

        // 5. Analyse des colis
        const smallPackages = adData.packages.filter((pkg: any) =>
          ["xs", "s"].includes(pkg.packageDimension?.toLowerCase())
        )

        const hasPriority = adData.packages.some(pkg => pkg.prioritaire)

        // 6. Calcul des frais
        const baseFee = parseFloat((base * 0.2).toFixed(2))
        let feeToUse = baseFee
        let discount = 0
        let bigPackageFee = 0
        if (base > 3000) {
          bigPackageFee = 75
          setSupplement3000(bigPackageFee)
        } else {
          bigPackageFee = 0
        }
        let amountToPay = base + baseFee + bigPackageFee




        // Réductions selon abonnement
        if (subData?.subscriptionTitle === "Premium") {
  console.log("🔔 Abonnement Premium détecté");
  console.log("→ Prix de base (base):", base);
  console.log("→ Frais de service (baseFee):", baseFee);
  console.log("→ Supplément colis volumineux (bigPackageFee):", bigPackageFee);
  console.log("→ Réduction Premium %:", subData.shippingDiscount);
  console.log("→ Réduction Permanente %:", subData.permanentDiscount);
  console.log("→ A déjà utilisé l'envoi gratuit :", subData.hasUsedFreeShipping);

  const isEligibleForFreeShipping = !subData.hasUsedFreeShipping && base < 150;

  if (isEligibleForFreeShipping) {
    console.log("✅ Éligible à l’envoi gratuit (<150€ et non utilisé)");

    feeToUse = 0;
    const fullDiscount = base + baseFee;
    discount = fullDiscount;
    setDiscount(fullDiscount);

    amountToPay = 0.01;
    setAmount(0.01);
    setFreeShippingActivated(true);

    console.log("🎁 Envoi gratuit activé → Total à payer : 0€");
    console.log("→ Remise totale appliquée :", fullDiscount);
  } else {
    console.log("❌ Non éligible à l’envoi gratuit, calcul des réductions...");

    const shippingDiscount = subData.shippingDiscount || 0;
    const permanentDiscount = subData.permanentDiscount || 0;

    const premiumReduction = parseFloat((base * (shippingDiscount / 100)).toFixed(2));
    const permanentReduction = parseFloat((base * (permanentDiscount / 100)).toFixed(2));

    const totalDiscount = premiumReduction + permanentReduction;

    console.log("→ Réduction Premium € :", premiumReduction);
    console.log("→ Réduction Permanente € :", permanentReduction);
    console.log("→ Réduction totale :", totalDiscount);

    discount = totalDiscount;
    setDiscount(totalDiscount);

    let subtotal = base + baseFee + bigPackageFee - totalDiscount;
    setSubtotal(subtotal);

    console.log("💵 Sous-total après réductions :", subtotal);

    let finalAmount = subtotal;

    // Supplément prioritaire si nécessaire
    if (hasPriority && !freeShippingActivated) {
      const priorityFee = finalAmount * (5 / 100);
      finalAmount += priorityFee;
      setHasPriorityFee(true);

      console.log(`⚠️ Supplément prioritaire appliqué (${priorityPercent}%):`, priorityFee.toFixed(2));
    }

    amountToPay = parseFloat(finalAmount.toFixed(2));

    console.log("✅ Montant final à payer :", amountToPay);
    setAmount(parseFloat(amountToPay.toFixed(2)));
  }
}



       else if (subData?.subscriptionTitle === "Starter") {
  console.log("=== Abonnement Starter détecté ===");
  console.log("Montant des colis (base):", base);
  console.log("Frais de service (baseFee):", baseFee);

  // Réduction de 5% sur les colis
  const baseReduction = base * 0.05;
  console.log("Réduction sur l’envoi de colis (5%):", baseReduction);

  // Réduction de 5% sur les frais de service

  const feeToUse = baseFee - feeReduction;
  const baseAfterDiscount = base - baseReduction;

  let subtotal = baseAfterDiscount + feeToUse ;
  let extraDiscount = 0;

  if (smallPackages.length > 0) {
    console.log("Petits colis détectés:", smallPackages.length);
    extraDiscount = base * 0.05;
    console.log("Remise supplémentaire (5% sur le sous-total):", extraDiscount);
  }

  discount = baseReduction + feeReduction + extraDiscount;
  amountToPay = subtotal - extraDiscount;
  setBaseReduction(baseReduction);
setFeeReduction(feeReduction);
setExtraDiscount(extraDiscount);
setDiscount(baseReduction + feeReduction + extraDiscount);
setPriorityFee(priorityFee);
  console.log("Montant total des remises:", discount);
  console.log("Montant total à payer:", amountToPay);
}



      else {
  amountToPay = base + baseFee;

  // Supplément prioritaire (15%) pour Free
  if (hasPriority && !freeShippingActivated) {
    const priorityFee = amountToPay * 0.15;
    amountToPay += priorityFee;
    setHasPriorityFee(true);
    setPriorityFee(priorityFee);

    console.log(`⚠️ Supplément prioritaire appliqué (15%) :`, priorityFee.toFixed(2));
  }

  console.log("💰 Amount Free (avec ou sans priorité) :", amountToPay.toFixed(2));
  
  setAmount(parseFloat(amountToPay.toFixed(2)));
}



        console.log("📦 hasPriority:", hasPriority);

        // Frais prioritaires
        if (hasPriority && !freeShippingActivated) {

          let surchargeApplied = false
          if (!subData?.subscriptionTitle || subData.subscriptionTitle === "Free") {
            const surcharge = amountToPay * 0.15
            amountToPay += surcharge
            surchargeApplied = true
          } else if (subData.subscriptionTitle === "Starter") {
            const surcharge = amountToPay * 0.05
            amountToPay += surcharge
            surchargeApplied = true
          } else if (subData.subscriptionTitle === "Premium") {
            const used = subData.priorityShippingUsed ?? 0
            const remaining = 3 - used
            setRemainingFreePriority(remaining > 0 ? remaining : 0)
            if (remaining <= 0) {
              const surcharge = amountToPay * 0.05
              amountToPay += surcharge
              surchargeApplied = true
            }
          }
          

          if (surchargeApplied) {
            setHasPriorityFee(true)
          }
        }
        
        console.log("💰 Calcul final:", {
          baseAmount: base,
          baseFee,
          feeToUse,
          discount,
          total: parseFloat(amountToPay.toFixed(2)),
        })
        if(subData.subscriptionTitle === "Starter"){
          setAmount(parseFloat(amountToPay.toFixed(2)));
        }
        
        setBaseAmount(base)
        setFee(baseFee)
        setDiscountedFee(feeToUse)
      } catch (err: any) {
        console.error("❌ Erreur dans fetchData:", err)
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
    if (!clientId || !providerId || !packageId || !amount) {
      setError("Informations incomplètes.")
      return
    }

    setLoading(true)
    try {
      
      const amountInCents = Math.round(amount * 100);
      const feeInCents = Math.round((amount - baseAmount) * 100);
      console.log("📦 packageId envoyé dans le fetch:", packageId, typeof packageId);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        clientId,
        providerId,
        amount: amountInCents,
        packageId: firstPackageId,
        fee: parseFloat((amount - baseAmount).toFixed(2)),
      }),

      })

      const data = await res.json()
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.message || "Erreur lors de la création du paiement.")
      }

      const card = elements.getElement(CardElement)
      if (!card) throw new Error("Champ carte introuvable.")

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card },
      })

      if (result.error) throw new Error(result.error.message!)

      if (result.paymentIntent?.status === "succeeded") {
        setSuccess(true)
        elements.getElement(CardElement)?.clear()

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${packageId}/paid`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        })


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
            Paiement de l'annonce #{packageId}
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
                  <h3 className="font-medium text-gray-900">Détails de l'annonce</h3>
                  <ul className="text-gray-600 text-sm space-y-1">
                    {Array.isArray(packageInfo) && packageInfo.map((pkg) => (
                      <li key={pkg.id}>
                        {pkg.packageName} - {pkg.packageWeight} kg - {pkg.packageDimension}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant à payer</label>
                <div className="text-sm text-gray-700 space-y-1 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span>{baseAmount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais de service (20%)</span>
                    <span>
                      {discountedFee < fee ? (
                        <>
                          <s className="text-gray-400">{fee.toFixed(2)} €</s>{" "}
                          <span className="text-green-600">{discountedFee.toFixed(2)} €</span>
                        </>
                      ) : (
                        <>{fee.toFixed(2)} €</>
                      )}
                    </span>
                  </div>
                  {subscription?.subscriptionTitle === "Premium" && !freeShippingActivated && (
                    <div className="text-xs text-gray-700 bg-white border border-gray-100 p-2 rounded mt-2">
                      <p className="mb-1 text-gray-500 italic">Détail du calcul :</p>

                      {/* Prix de base */}
                      <div className="flex justify-between">
                        <span>Prix de base :</span>
                        <span>{baseAmount.toFixed(2)} €</span>
                      </div>

                      {/* Frais de service */}
                      <div className="flex justify-between">
                        <span>+ Frais de service (20%) :</span>
                        <span>{fee.toFixed(2)} €</span>
                      </div>

                      {/* Réductions */}
                      <div className="flex justify-between text-green-700">
                        <span>– Réduction Premium ({subscription.shippingDiscount || 0}%) :</span>
                        <span>- {(baseAmount * (subscription.shippingDiscount || 0) / 100).toFixed(2)} €</span>
                      </div>

                      <div className="flex justify-between text-green-700">
                        <span>– Réduction Permanente ({subscription.permanentDiscount || 0}%) :</span>
                        <span>- {(baseAmount * (subscription.permanentDiscount || 0) / 100).toFixed(2)} €</span>
                      </div>
                      {supplement3000 > 0 && (
                        <div className="flex justify-between text-red-700">
                          <span>+ Supplément colis &gt; 3000 € :</span>
                          <span>+ {supplement3000.toFixed(2)} €</span>
                        </div>
                      )}


                      <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                        <span>Sous-total :</span>
                        <span>
                          {(baseAmount + fee + supplement3000
                            - (baseAmount * (subscription.shippingDiscount || 0) / 100)
                            - (baseAmount * (subscription.permanentDiscount || 0) / 100)).toFixed(2)} €
                        </span>
                      </div>


                      {/* Supplément prioritaire */}
                      {hasPriorityFee && (
                        <div className="flex justify-between text-red-700">
                          <span>+ Supplément prioritaire ({priorityPercent}%) :</span>
                          <span>
                            + {(
                              (baseAmount + fee + supplement3000
                                - (baseAmount * (subscription.shippingDiscount || 0) / 100)
                                - (baseAmount * (subscription.permanentDiscount || 0) / 100)
                              ) * 0.05
                            ).toFixed(2)} €
                          </span>
                        </div>
                      )}

                      {/* Total final */}
                      <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                        <span>Total :</span>
                        <span>{amount.toFixed(2)} €</span>
                      </div>
                    </div>
                  )}





                  {subscription?.subscriptionTitle === "Starter" && (
  <div className="text-xs text-gray-700 bg-white border border-gray-100 p-2 rounded mt-2">
    <p className="mb-1 text-gray-500 italic">Détail du calcul :</p>

    {/* Prix de base */}
    <div className="flex justify-between">
      <span>Prix de base :</span>
      <span>{baseAmount.toFixed(2)} €</span>
    </div>

    {/* Frais de service */}
    <div className="flex justify-between">
      <span>+ Frais de service (20%) :</span>
      <span>{fee.toFixed(2)} €</span>
    </div>


    {/* Réduction sur l’envoi de colis */}
    {baseReduction > 0 && (
      <div className="flex justify-between text-green-700">
        <span>– Réduction colis (5%) :</span>
        <span>- {baseReduction.toFixed(2)} €</span>
      </div>
    )}

    {/* Réduction sur les frais de service */}
    {feeReduction > 0 && (
      <div className="flex justify-between text-green-700">
        <span>– Réduction service (5%) :</span>
        <span>- {feeReduction.toFixed(2)} €</span>
      </div>
    )}

    {/* Réduction supplémentaire si petits colis */}
    {extraDiscount > 0 && (
      <div className="flex justify-between text-green-700">
        <span>– Réduction suppl. (petits colis) :</span>
        <span>- {extraDiscount.toFixed(2)} €</span>
      </div>
    )}

    {/* Sous-total */}
    <div className="flex justify-between font-semibold border-t pt-1 mt-1">
      <span>Sous-total :</span>
      <span>{(baseAmount + fee + bigPackageFee - discount).toFixed(2)} €</span>
    </div>

    {/* Supplément prioritaire */}
    {hasPriorityFee && (
      <div className="flex justify-between text-red-700">
        <span>+ Supplément prioritaire ({priorityPercent}%) :</span>
        <span>
          + {((baseAmount + fee  - discount) * (priorityPercent / 100)).toFixed(2)} €
        </span>
      </div>
    )}

    {/* Total final */}
    <div className="flex justify-between font-semibold border-t pt-1 mt-1">
      <span>Total :</span>
      <span>{amount.toFixed(2)} €</span>
    </div>
  </div>
)}


                  {subscription?.subscriptionTitle !== "Starter" && subscription?.subscriptionTitle !== "Premium" && (
                    <div className="text-xs text-gray-700 bg-white border border-gray-100 p-2 rounded mt-2">
                    <p className="mb-1 text-gray-500 italic">Détail du calcul :</p>

                    <div className="flex justify-between">
                      <span>Prix de base :</span>
                      <span>{baseAmount.toFixed(2)} €</span>
                    </div>

                    <div className="flex justify-between">
                      <span>+ Frais de service (20%) :</span>
                      <span>{fee.toFixed(2)} €</span>
                    </div>


                    <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                      <span>Sous-total :</span>
                      <span>{(baseAmount + fee ).toFixed(2)} €</span>
                    </div>

                    {hasPriorityFee && (
  <div className="flex justify-between text-red-700">
    <span>+ Supplément prioritaire ({priorityPercent}%) :</span>
    <span>+ {priorityFee.toFixed(2)} €</span>
  </div>
)}


                    <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                      <span>Total :</span>
                      <span>{amount.toFixed(2)} €</span>
                    </div>
                  </div>
                  )}

                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total à payer</span>
                    <span>{amount.toFixed(2)} €</span>
                  </div>

                    {discount > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Promotions appliquées</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {freeShippingActivated ? (
                            <>
                              <li className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                Frais offerts (colis &lt; 150 €)
                              </li>
                            </>
                          ) : (

                            <>
                              {subscription?.subscriptionTitle === "Premium" && (
                                <li className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                14% de réduction sur 120 € (livraison) : –16.80 €
                              </li>

                              )}
                              {subscription?.subscriptionTitle === "Starter" && (
                                <>
                                  <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                    Réduction frais 5%
                                  </li>
                                  {["xs", "s"].includes(packageInfo?.packageDimension) && (
                                    <li className="flex items-center">
                                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                      Réduction XS/S 5%
                                    </li>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </ul>
                      </div>
                    )}
                    {packageInfo?.prioritaire && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Frais prioritaire</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {hasPriorityFee ? (
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-yellow-500" />
                              Des frais ont été ajoutés pour livraison prioritaire
                            </li>
                          ) : (
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              Livraison prioritaire offerte
                            </li>
                          )}
                          {subscription?.subscriptionTitle === "Premium" && remainingFreePriority !== null && (
                            <li className="text-xs text-gray-500 ml-6">
                              {remainingFreePriority} livraison{remainingFreePriority > 1 ? "s" : ""} prioritaire{remainingFreePriority > 1 ? "s" : ""} gratuite{remainingFreePriority > 1 ? "s" : ""} restante{remainingFreePriority > 1 ? "s" : ""}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  {subscription?.subscriptionTitle === "Premium" && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Résumé des avantages Premium</h4>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Assurance colis : <strong>{subscription.packageInsurance ? "Active " : "Non activée"}</strong>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle
                            className={`w-4 h-4 mr-2 ${
                              freeShippingActivated
                                ? "text-green-500"
                                : !subscription?.hasUsedFreeShipping && baseAmount < 150
                                ? "text-gray-400"
                                : "text-gray-400"
                            }`}
                          />
                          Premier envoi offert :{" "}
                          <strong>
                            {freeShippingActivated
                              ? "Active"
                              : !subscription?.hasUsedFreeShipping && baseAmount < 150
                              ? "Non activé"
                              : "Déjà utilisé"}
                          </strong>

                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Réduction Premium (expédition) : <strong>{subscription.shippingDiscount}% Active</strong>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Réduction permanente : <strong>{subscription.permanentDiscount}% Active</strong>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle
                            className={`w-4 h-4 mr-2 ${
                              isPriority
                                ? hasPriorityFee
                                  ? "text-green-500"
                                  : "text-green-500"
                                : "text-gray-400"
                            }`}
                          />
                          Livraison prioritaire :{" "}
                          <strong>
                            {!isPriority
                              ? "Non concerné"
                              : remainingFreePriority && remainingFreePriority > 0
                              ? `Gratuite (${remainingFreePriority} restante${remainingFreePriority > 1 ? "s" : ""})`
                              : hasPriorityFee
                              ? `Supplément appliqué (${priorityPercent}%)`
                              : "Offerte (aucun frais)"}
                          </strong>
                        </li>

                        <li className="flex items-center">
                          <CheckCircle
                            className={`w-4 h-4 mr-2 ${
                              baseAmount > 3000 && subscription.supplement3000
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          />
                          Supplément 75€ pour colis &gt; 3000 € :{" "}
                          <strong>
                            {baseAmount > 3000 && subscription.supplement3000
                              ? "À appliquer"
                              : "Non concerné"}
                          </strong>
                        </li>

                      </ul>
                    </div>
                  )}


                  {subscription?.subscriptionTitle === "Starter" &&
                    (packageInfo?.packageDimension === "xs" || packageInfo?.packageDimension === "s") && (
                      <p className="text-sm text-green-600 mt-1">
                        Grâce à votre abonnement <strong>Starter</strong>, vous avez bénéficié de <strong>{subscription.permanentDiscount}% de réduction</strong> sur le total.
                      </p>
                  )}
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
                  disabled={loading || !stripe || !clientId || !providerId}
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
