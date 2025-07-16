'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from "next/link";
import { MessageCircle } from 'lucide-react';
import { useRouter } from "next/navigation"

interface Localisation {
  currentStreet: string;
  currentCity: string;
  currentPostalCode: number;
  destinationStreet: string;
  destinationCity: string;
  destinationPostalCode: number;
}

interface PackageType {
  id: number;
  packageName: string;
  packageWeight: number;
  packageQuantity: number;
  packageDimension: string;
  localisations: Localisation[];
  deliveryStatus?: string;
  additionalInformation?: string;
  advertisementId?: number;
}

interface Advertisement {
  id: number;
  advertisementPrice: number;
  advertisementStatus: string;
  advertisementBeginning: string;
  advertisementEnd: string;
  additionalInformation: string;
  creatorRole: string;
  advertisementPhoto?: string;
}


interface IPackage extends PackageType {}

export default function DeliveryHistory() {
  const [history, setHistory] = useState<IPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [livreurId, setLivreurId] = useState<number | null>(null);
  const [clientIds, setClientIds] = useState<{ [key: number]: number | null }>({});
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPackages = history.slice(indexOfFirst, indexOfLast);
  const [advertisements, setAdvertisements] = useState<{ [key: number]: Advertisement }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Utilisateur non connecté. Token manquant.');
      setLoading(false);
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.userId) {
          setLivreurId(res.data.userId);
        } else {
          setError('Utilisateur non valide ou ID manquant dans la réponse.');
        }
      } catch (err: any) {
        setError('Erreur lors de la récupération de l’utilisateur : ' + (err.response?.data?.message || err.message));
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/packages/history`, {
          params: { userId: livreurId },
        });
        setHistory(response.data);
      } catch (err: any) {
        console.error('Erreur lors de la récupération de l\'historique :', err);
        setError('Impossible de charger l\'historique des livraisons.');
      } finally {
        setLoading(false);
      }
    };

    if (livreurId !== null) {
      fetchHistory();
    }
  }, [livreurId]);

  useEffect(() => {
    const fetchClientIdsAndAds = async () => {
      const token = localStorage.getItem('token');
      const newClientIds: { [key: number]: number | null } = {};
      const newAds: { [key: number]: Advertisement } = {};

      await Promise.all(history.map(async (pkg) => {
        if (pkg.advertisementId && !clientIds[pkg.id]) {
          try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${pkg.advertisementId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            newClientIds[pkg.id] = res.data?.usersId || null;
            newAds[pkg.id] = res.data;
          } catch (err) {
            console.error(`Erreur récupération annonce pour package ${pkg.id}`, err);
          }
        }
      }));

      setClientIds(prev => ({ ...prev, ...newClientIds }));
      setAdvertisements(prev => ({ ...prev, ...newAds }));
    };

    if (history.length > 0) {
      fetchClientIdsAndAds();
    }
  }, [history]);

  const openModal = (url: string) => {
    setModalImageUrl(url);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageUrl(null);
  };


if (loading) return <p>Chargement en cours...</p>;
if (error) return <p className="text-red-600">{error}</p>;

return (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">Historique de Mes Livraisons</h1>
    {history.length === 0 ? (
      <p>Aucune livraison historique à afficher.</p>
    ) : (
      <ul>
        {currentPackages.map((pkg) => {
          const ad = advertisements[pkg.id];

          return (
            <li key={pkg.id} className="border p-4 mb-4 rounded shadow">
              {ad && (
                <div className="mt-4 bg-gray-50 p-3 rounded">
                  <h3 className="font-semibold mb-1">📦 Détails Annonce :</h3>
                  <p><strong>Prix :</strong> {ad.advertisementPrice} €</p>
                  <p><strong>Statut :</strong> {ad.advertisementStatus}</p>
                  <p><strong>Période :</strong> {new Date(ad.advertisementBeginning).toLocaleDateString()} → {new Date(ad.advertisementEnd).toLocaleDateString()}</p>
                  <p><strong>Rôle créateur :</strong> {ad.creatorRole}</p>
                  <p><strong>Note :</strong> {ad.additionalInformation}</p>
                  {ad.advertisementPhoto && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${ad.advertisementPhoto}`}
                      alt="Annonce"
                      onClick={() => openModal(`${process.env.NEXT_PUBLIC_API_URL}/uploads/${ad.advertisementPhoto}`)}
                      className="mt-2 w-32 cursor-pointer rounded shadow hover:opacity-75 transition"
                    />
                  )}
                </div>
              )}

              {clientIds[pkg.id] && (
                <Link
                  href={`/dashboard/livreur/chat/${clientIds[pkg.id]}?packageId=${pkg.id}`}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contacter le client
                </Link>
                
              )}
              <button
                            onClick={() => router.push(`/dashboard/livreur/announcementPage/${pkg.advertisementId}`)}
                            className="flex items-center justify-center gap-2 px-4 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                          >
                            Voir détail
                          </button>
            </li>
          );
        })}
      </ul>
    )}

    {/* 🟢 MODAL ici dans le return */}
    {isModalOpen && modalImageUrl && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded shadow-lg max-w-3xl w-full relative">
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-gray-700 hover:text-red-600 font-bold text-xl"
          >
            &times;
          </button>
          <img
            src={modalImageUrl}
            alt="Annonce agrandie"
            className="w-full h-auto rounded"
          />
        </div>
      </div>
    )}
    
  </div>
);





}

