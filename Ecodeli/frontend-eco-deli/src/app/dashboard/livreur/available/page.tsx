'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface IPackage {
  id: number;
  packageName: string;
  packageWeight: number;
  packageDimension: string;
  packageDescription: string;
  senderAddress: string;
  recipientAddress: string;
  packageRequirements: string;
}

export default function LivreurDashboard() {
  const [mounted, setMounted] = useState(false);
  const [packages, setPackages] = useState<IPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [livreurId, setLivreurId] = useState<number | null>(null);

  useEffect(() => {
    // Indique que nous sommes en environnement client
    setMounted(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Utilisateur non connecté. Token manquant.');
      setLoading(false);
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        console.log('Tentative de récupération de l\'utilisateur connecté...');
        const res = await axios.get('http://51.15.231.248:3001/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Réponse de l\'API utilisateur :', res.data);
        if (res.data && res.data.userId) {
          setLivreurId(res.data.userId);
        } else {
          setError('Utilisateur non valide ou ID manquant dans la réponse.');
        }
      } catch (err: any) {
        console.error('Erreur API lors de la récupération de l\'utilisateur :', err);
        setError('Erreur lors de la récupération de l\'utilisateur. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Charger les colis une fois l'ID du livreur récupéré
  useEffect(() => {
    if (livreurId !== null) {
      fetchPackages();
    }
  }, [livreurId]);

  const fetchPackages = async () => {
    try {
      const response = await axios.get('http://51.15.231.248:3001/packages/available');
      setPackages(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des colis :', err);
      setError('Impossible de charger les colis.');
      setLoading(false);
    }
  };

  const handleTakePackage = async (packageId: number) => {
    if (!livreurId) {
      alert('Utilisateur non connecté.');
      return;
    }

    try {
      await axios.post(`http://51.15.231.248:3001/packages/${packageId}/take`, {
        userId: livreurId,
      });
      alert('Colis pris en charge !');
      fetchPackages(); // Rafraîchissement de la liste des colis
    } catch (error: any) {
      console.error('Erreur lors de la prise du colis :', error);
      alert('Erreur lors de la prise du colis : ' + (error.response?.data?.message || error.message));
    }
  };

  // Tant que le composant n'est pas monté, ne pas rendre quoi que ce soit
  if (!mounted) return null;
  if (loading) return <p>Chargement en cours...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4">
      {/* Bouton pour accéder à la page "Mes Livraisons en Cours" */}
      <div className="mb-4">
      <Link
        href="/dashboard/livreur/mydeliveries"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Mes Livraisons en Cours
      </Link>

      </div>
      <h1 className="text-xl font-bold mb-4">Colis Disponibles</h1>
      {packages.length === 0 ? (
        <p>Aucun colis disponible pour le moment.</p>
      ) : (
        <ul>
          {packages.map((pkg) => (
            <li key={pkg.id} className="border p-4 mb-4 rounded shadow">
              <h2 className="text-lg font-semibold">{pkg.packageName}</h2>
              <p><strong>Poids :</strong> {pkg.packageWeight}</p>
              <p><strong>Dimension :</strong> {pkg.packageDimension}</p>
              <p><strong>Description :</strong> {pkg.packageDescription}</p>
              <p><strong>Adresse d'envoi :</strong> {pkg.senderAddress}</p>
              <p><strong>Adresse de réception :</strong> {pkg.recipientAddress}</p>
              <p><strong>Exigences :</strong> {pkg.packageRequirements}</p>
              <button
                onClick={() => handleTakePackage(pkg.id)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Prendre en charge
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
