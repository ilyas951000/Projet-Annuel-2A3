'use client';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';

// Étendre l'interface IPackage pour inclure advertisementId
interface IPackage {
  id: number;
  packageName: string;
  packageWeight: number;
  packageDimension: string;
  packageDescription: string;
  senderAddress: string;
  recipientAddress: string;
  packageRequirements: string;
  advertisementId?: number;
}

export default function LivreurDashboard() {
  const [mounted, setMounted] = useState(false);
  const [packages, setPackages] = useState<IPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [livreurId, setLivreurId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Utilisateur non connecté. Token manquant.');
      setLoading(false);
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:3001/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.userId) {
          setLivreurId(res.data.userId);
        } else {
          setError('Utilisateur non valide ou ID manquant.');
        }
      } catch (err: any) {
        setError('Erreur lors de la récupération de l\u2019utilisateur. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (livreurId !== null) {
      fetchPackages();
    }
  }, [livreurId]);

  const fetchPackages = async () => {
    try {
      const response = await axios.get<IPackage[]>('http://127.0.0.1:3001/packages/available');
      setPackages(response.data);
    } catch (err) {
      setError('Impossible de charger les colis.');
      setLoading(false);
    }
  };

  // Regrouper par advertisementId
  const groupedByAd = useMemo(() => {
    return packages.reduce<Record<string, IPackage[]>>((acc, pkg) => {
      const key = pkg.advertisementId?.toString() || 'sansAnnonce';
      if (!acc[key]) acc[key] = [];
      acc[key].push(pkg);
      return acc;
    }, {});
  }, [packages]);

  const handleTakePackage = async (packageId: number) => {
    if (!livreurId) {
      alert('Utilisateur non connecté.');
      return;
    }
    try {
      await axios.post(`http://127.0.0.1:3001/packages/${packageId}/take`, { userId: livreurId });
      alert('Colis pris en charge !');
      fetchPackages();
    } catch (error: any) {
      alert('Erreur lors de la prise du colis : ' + (error.response?.data?.message || error.message));
    }
  };

  // Prendre tous les colis d'un groupe
  const handleTakeAll = async (pkgs: IPackage[]) => {
    if (!livreurId) {
      alert('Utilisateur non connecté.');
      return;
    }
    try {
      await Promise.all(pkgs.map(p => axios.post(`http://127.0.0.1:3001/packages/${p.id}/take`, { userId: livreurId })));
      alert('Tous les colis pris en charge !');
      fetchPackages();
    } catch (error: any) {
      alert('Erreur lors de la prise des colis : ' + (error.response?.data?.message || error.message));
    }
  };

  if (!mounted) return null;
  if (loading) return <p>Chargement en cours...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link href="/dashboard/livreur/mydeliveries" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Mes Livraisons en Cours
        </Link>
      </div>
      <h1 className="text-xl font-bold mb-4">Colis Disponibles</h1>
      {Object.keys(groupedByAd).length === 0 ? (
        <p>Aucun colis disponible pour le moment.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByAd).map(([adId, pkgs]) => (
            <div key={adId} className="border p-4 rounded shadow">
              {adId !== 'sansAnnonce' && <h2 className="font-semibold mb-2">Annonce #{adId}</h2>}
              {pkgs.map(pkg => (
                <div key={pkg.id} className="mb-4">
                  <h3 className="text-lg font-medium">{pkg.packageName}</h3>
                  <p><strong>Poids :</strong> {pkg.packageWeight}</p>
                  <p><strong>Dimension :</strong> {pkg.packageDimension}</p>
                  <p><strong>Description :</strong> {pkg.packageDescription}</p>
                  <p><strong>Adresse d'envoi :</strong> {pkg.senderAddress}</p>
                  <p><strong>Adresse de réception :</strong> {pkg.recipientAddress}</p>
                  <p><strong>Exigences :</strong> {pkg.packageRequirements}</p>
                  <button
                    onClick={() => handleTakePackage(pkg.id)}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Prendre
                  </button>
                </div>
              ))}
              {pkgs.length > 1 && (
                <button
                  onClick={() => handleTakeAll(pkgs)}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Je prends tous ces colis
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
