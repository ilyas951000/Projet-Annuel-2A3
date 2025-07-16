'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Role {
  id: number;
  name: string;
}

const PrestataireRegister: React.FC = () => {
  const [message, setMessage] = useState('');
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prestataire-roles`);
        const data = await res.json();
        setRoles(data);
      } catch (err) {
        console.error('Erreur de récupération des rôles :', err);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = e.currentTarget;
  const formData = new FormData(form);

  const confirmPassword = formData.get('confirmPassword');
  const [roles, setRoles] = useState<Role[]>([]);

  const data = {
    userFirstName: formData.get('userFirstName'),
    userLastName: formData.get('userLastName'),
    email: formData.get('email'),
    password: formData.get('password'),
    userAddress: formData.get('userAddress'),
    userStatus: 'prestataire',
    prestataireRoleId: parseInt(selectedRoleId, 10),
  };

  if (data.password !== confirmPassword) {
    setMessage('Les mots de passe ne correspondent pas.');
    return;
  }

  try {
    // Étape 1 : inscription utilisateur
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      setMessage(result.message || "Erreur lors de l'inscription.");
      return;
    }

    const userId = result.user?.id || result.userId; // dépend du backend

    // Étape 2 : récupérer le nom du rôle sélectionné
    const selectedRole = roles.find(role => role.id.toString() === selectedRoleId);
    const prestationType = selectedRole?.name || '';

    // Étape 3 : création du profil public
    const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public-profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prestationType,
        price: 0,
        description: "", // string : nom du rôle
      }),
    });

    if (!profileRes.ok) {
      const profileError = await profileRes.json();
      setMessage(`Utilisateur créé, mais erreur profil public : ${profileError.message}`);
      return;
    }

    setMessage('Inscription réussie ! Connectez-vous pour compléter votre profil.');
    form.reset();

  } catch (err) {
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

        <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">Inscription Prestataire</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input name="userFirstName" placeholder="Prénom" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input name="userLastName" placeholder="Nom" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input name="email" type="email" placeholder="Adresse e-mail" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input name="password" type="password" placeholder="Mot de passe" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input name="confirmPassword" type="password" placeholder="Confirmer le mot de passe" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input name="userAddress" placeholder="Adresse" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />

          <select
            name="prestataireRoleId"
            required
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Sélectionner un rôle --</option>
            {roles.map((role: any) => (
              <option key={role.id} value={role.id}>
                {role.id} - {role.name}
              </option>
            ))}
          </select>

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

export default PrestataireRegister;
