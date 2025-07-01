'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const ClientRegister: React.FC = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      userFirstName: formData.get('userFirstName'),
      userLastName: formData.get('userLastName'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      userAddress: formData.get('userAddress'),
      userStatus: 'livreur',
    };

    if (data.password !== data.confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      setMessage(res.ok ? result.message || 'Inscription réussie !' : result.message || "Erreur lors de l'inscription.");
      if (res.ok) form.reset();
    } catch {
      setMessage('Erreur lors de la connexion au serveur.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-800 to-green-400 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-3xl font-bold text-center mb-6">
          <span className="text-green-600">Eco</span>
          <span className="text-gray-800">Deli</span>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">Inscription Livreur</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input name="userFirstName" placeholder="Prénom" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input name="userLastName" placeholder="Nom" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input name="email" type="email" placeholder="Adresse e-mail" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input name="password" type="password" placeholder="Mot de passe" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input name="confirmPassword" type="password" placeholder="Confirmer le mot de passe" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input name="userAddress" placeholder="Adresse" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />

          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            Continuer
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-red-600 text-center">{message}</p>}

        <div className="mt-6 flex justify-between text-sm text-green-700 font-medium">
          <Link href="/" className="hover:underline">← Accueil</Link>
          <Link href="/connexion" className="hover:underline">Connexion →</Link>
        </div>
      </div>
    </div>
  );
};

export default ClientRegister;
