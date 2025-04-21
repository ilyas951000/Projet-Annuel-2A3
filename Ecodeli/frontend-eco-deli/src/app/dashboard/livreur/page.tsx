"use client";

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import axios from 'axios';

type UserData = {
  userId: number;
  userStatus: string;
  occasionalCourier: boolean;
};

const AdminConnexion: NextPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token récupéré:', token);

    const fetchUserData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://51.15.231.248:3001/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Données utilisateur:', res.data);

        const data = res.data;
        const formattedData: UserData = {
          ...data,
          occasionalCourier: Boolean(data.occasionalCourier),
        };

        setUserData(formattedData);
      } catch (err) {
        console.error('Erreur lors de la récupération des infos utilisateur', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Chargement...</p>;
  }

  if (!userData) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-600">Utilisateur non connecté ou token invalide.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-3xl font-bold">Bienvenue sur votre espace livreur</h1>

      {userData.occasionalCourier ? (
          <>
            <Link href="/dashboard/livreur/available">
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                Voir les annonces disponibles
              </button>
            </Link>
            <Link href="/dashboard/livreur/movements">
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                Voir les déplacements que vous souhaitais
              </button>
            </Link>
            <Link href="/dashboard/livreur/planning">
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                Afficher votre planning
              </button>
            </Link>
          </>
        ) : (
          <Link href="/dashboard/livreur/documents">
            <button className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition">
              Envoyer mes justificatifs
            </button>
          </Link>
        )}

    </div>
  );
};

export default AdminConnexion;
