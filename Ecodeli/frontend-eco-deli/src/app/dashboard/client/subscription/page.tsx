"use client"

import React, { useEffect, useState } from 'react'
import axios from 'axios'


const plans = [
  {
    name: 'Starter',
    price: 10,
    planId: 'starter_plan',
    priceId: 'price_1RR8liENhvkcPeq4meFzZRrU',
  },
  {
    name: 'Premium',
    price: 20,
    planId: 'premium_plan',
    priceId: 'price_1RR8mQENhvkcPeq4wyYK9q2a',
  },
]

export default function SubscriptionPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [subscription, setSubscription] = useState<number | null>(null)
  const [loading, setUserLoading] = useState<boolean>(true)
  const [error, setUserError] = useState<string | null>(null)

  

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token manquant')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Erreur récupération utilisateur")
      const authData = await res.json()
      const id = authData.userId
      setUserId(id)
      setEmail(authData.email)
      console.log('check si email est bon', authData.email)

      const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`)
      if (!userRes.ok) throw new Error("Erreur récupération infos utilisateur")
      const userData = await userRes.json()

      if (typeof userData.userSubscription === 'number') {
        setSubscription(userData.userSubscription)
      }
    } catch (err) {
      setUserError(err.message)
    } finally {
      setUserLoading(false)
    }
  }

  fetchUser()
}, [])

  const handleSubscribe = async (priceId: string, plan: string) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/subscription-checkout`, {
        userId,
        priceId,
        plan,
      })
      window.location.href = res.data.url
    } catch (err) {
      alert("Erreur lors de la souscription")
    }
  }

  const handleCancel = async () => {
    try {
      console.log('Email envoyé pour annulation :', email);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/cancel-subscription`, {
        email,
      })
      alert('Abonnement annulé')
      setSubscription(0)
    } catch (err) {
      alert("Erreur lors de l'annulation")
    }
  }

  const getPlanName = () => {
    switch (subscription) {
      case 1:
        return 'Starter'
      case 2:
        return 'Premium'
      default:
        return 'Aucun'
    }
  }

  if (loading) return <p>Chargement...</p>
  if (error) return <p>Erreur : {error}</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Votre abonnement actuel : {getPlanName()}</h2>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        {plans.map((plan) => (
          <div key={plan.planId} style={{ border: '1px solid #ccc', padding: '1rem' }}>
            <h3>{plan.name}</h3>
            <p>{plan.price} €/mois</p>
            <button
              onClick={() => handleSubscribe(plan.priceId, plan.planId)}
              style={{
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                marginTop: '1rem',
              }}
            >
              Choisir ce plan
            </button>

          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={handleCancel}
          style={{
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Annuler mon abonnement
        </button>

      </div>
    </div>
  )
}
