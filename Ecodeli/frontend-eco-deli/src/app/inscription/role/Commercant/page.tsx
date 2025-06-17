'use client';

import React, { useState } from 'react';

const CommercantRegister: React.FC = () => {
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
      shopName: formData.get('shopName'),
      userStatus: 'commercant',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-800 to-green-400">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <div className="text-white text-xl font-bold">
          <span className="text-green-500">Eco</span>
          <span className="text-black">Deli</span>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Inscription Commerçant</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input name="userFirstName" placeholder="Prénom" required className="input" />
          <input name="userLastName" placeholder="Nom" required className="input" />
          <input name="email" type="email" placeholder="Adresse e-mail" required className="input" />
          <input name="password" type="password" placeholder="Mot de passe" required className="input" />
          <input name="confirmPassword" type="password" placeholder="Confirmer le mot de passe" required className="input" />
          <input name="userAddress" placeholder="Adresse" required className="input" />
          <input name="shopName" placeholder="Nom du commerce" required className="input" />

          <button type="submit" className="w-full bg-green-800 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">Continuer</button>
        </form>

        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
      </div>
    </div>
  );
};

export default CommercantRegister;
