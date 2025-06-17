'use client';

import React, { useState } from 'react';

export default function LivreurRegisterPage() {
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
      setMessage(res.ok ? result.message || 'Inscription réussie !' : result.message || 'Erreur.');
      if (res.ok) form.reset();
    } catch {
      setMessage('Erreur serveur.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold">Inscription Livreur</h1>
        <input name="userFirstName" placeholder="Prénom" required className="input" />
        <input name="userLastName" placeholder="Nom" required className="input" />
        <input name="email" type="email" placeholder="Email" required className="input" />
        <input name="password" type="password" placeholder="Mot de passe" required className="input" />
        <input name="confirmPassword" type="password" placeholder="Confirmer" required className="input" />
        <input name="userAddress" placeholder="Adresse" required className="input" />
        <button type="submit" className="w-full bg-green-700 text-white py-2 rounded">S’inscrire</button>
        {message && <p className="text-sm text-red-600">{message}</p>}
      </form>
    </div>
  );
}
