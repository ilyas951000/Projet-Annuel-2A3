"use client";

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
  deliveryStatus: string;
  isPaid?: boolean; // ✅ on ajoute ce champ ici
}

interface IUser {
  id: number;
  userLastName: string;
  userFirstName: string;
  email: string;
  userStatus: string;
}

const STATUS_OPTIONS = ["pris en charge", "en transit", "livré", "transféré"];

export default function MyDeliveries() {
  const [deliveries, setDeliveries] = useState<IPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [livreurId, setLivreurId] = useState<number | null>(null);
  const [statusSelections, setStatusSelections] = useState<{ [key: number]: string }>({});
  const [transferSelections, setTransferSelections] = useState<{ [key: number]: string }>({});
  const [livreurs, setLivreurs] = useState<IUser[]>([]);

  useEffect(() => {
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
        if (res.data && res.data.userId) {
          setLivreurId(res.data.userId);
        } else {
          setError('Utilisateur non valide ou ID manquant dans la réponse.');
        }
      } catch (err: any) {
        setError('Erreur lors de la récupération de l’utilisateur. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchLivreurs = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:3001/users');
        const livreursData = res.data.filter((user: IUser) => user.userStatus === "livreur");
        setLivreurs(livreursData);
      } catch (err) {
        console.error("Erreur lors du chargement des livreurs :", err);
      }
    };
    fetchLivreurs();
  }, []);

  useEffect(() => {
    if (livreurId !== null) {
      fetchDeliveries();
    }
  }, [livreurId]);

  const fetchDeliveries = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:3001/packages/mydeliveries', {
        params: { userId: livreurId },
      });

      // ✅ Ne garder que les colis où isPaid est true (ou 1)
      const paidDeliveries = response.data.filter((pkg: IPackage) => pkg.isPaid === true || pkg.isPaid === 1);

      setDeliveries(paidDeliveries);

      const initialSelections: { [key: number]: string } = {};
      paidDeliveries.forEach((pkg: IPackage) => {
        initialSelections[pkg.id] = pkg.deliveryStatus;
      });
      setStatusSelections(initialSelections);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des livraisons :', err);
      setError('Impossible de charger les livraisons.');
    }
  };

  const handleStatusUpdate = async (packageId: number) => {
    const newStatus = statusSelections[packageId];
    if (!newStatus) {
      alert('Veuillez sélectionner un statut.');
      return;
    }
    if (newStatus === "transféré" && !transferSelections[packageId]) {
      alert("Veuillez sélectionner un livreur pour le transfert.");
      return;
    }
    try {
      await axios.patch(`http://127.0.0.1:3001/packages/${packageId}/status`, {
        status: newStatus,
        fromCourierId: livreurId,
        toCourierId: newStatus === "transféré" ? transferSelections[packageId] : null,
      });
      alert('Statut mis à jour !');
      fetchDeliveries();
    } catch (err: any) {
      alert('Erreur lors de la mise à jour du statut : ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <p>Chargement en cours...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link
          href="/dashboard/livreur/history"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Consulter l'historique
        </Link>
      </div>

      <h1 className="text-xl font-bold mb-4">Mes Livraisons en Cours</h1>
      {deliveries.length === 0 ? (
        <p>Aucune livraison en cours.</p>
      ) : (
        <ul>
          {deliveries.map((pkg) => (
            <li key={pkg.id} className="border p-4 mb-4 rounded shadow">
              <h2 className="text-lg font-semibold">{pkg.packageName}</h2>
              <p><strong>Poids :</strong> {pkg.packageWeight}</p>
              <p><strong>Dimension :</strong> {pkg.packageDimension}</p>
              <p><strong>Description :</strong> {pkg.packageDescription}</p>
              <p><strong>Adresse d'envoi :</strong> {pkg.senderAddress}</p>
              <p><strong>Adresse de réception :</strong> {pkg.recipientAddress}</p>
              <p><strong>Exigences :</strong> {pkg.packageRequirements}</p>
              <p><strong>Statut actuel :</strong> {pkg.deliveryStatus}</p>

              <div className="mt-2 flex flex-col gap-2">
                <label htmlFor={`status-select-${pkg.id}`} className="font-semibold">
                  Nouveau statut :
                </label>
                <select
                  id={`status-select-${pkg.id}`}
                  value={statusSelections[pkg.id] || pkg.deliveryStatus}
                  onChange={(e) =>
                    setStatusSelections({ ...statusSelections, [pkg.id]: e.target.value })
                  }
                  className="border p-1 rounded"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {statusSelections[pkg.id] === "transféré" && (
                  <div className="mt-2 flex flex-col gap-2">
                    <label htmlFor={`transfer-select-${pkg.id}`} className="font-semibold">
                      Transférer à :
                    </label>
                    <select
                      id={`transfer-select-${pkg.id}`}
                      value={transferSelections[pkg.id] || ""}
                      onChange={(e) =>
                        setTransferSelections({
                          ...transferSelections,
                          [pkg.id]: e.target.value,
                        })
                      }
                      className="border p-1 rounded"
                    >
                      <option value="">-- Choisir un livreur --</option>
                      {livreurs
                        .filter((l) => l.id !== livreurId)
                        .map((livreur) => (
                          <option key={livreur.id} value={livreur.id}>
                            {livreur.userFirstName} {livreur.userLastName}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={() => handleStatusUpdate(pkg.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mettre à jour le statut
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
