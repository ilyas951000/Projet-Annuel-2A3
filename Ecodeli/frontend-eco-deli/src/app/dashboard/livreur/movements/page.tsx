'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface IMovement {
  id: number;
  city: string;
  isOrigin: boolean;
  active: boolean;
}

const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Lille'];

export default function MovementsPage() {
  const [mounted, setMounted] = useState(false);
  const [livreurId, setLivreurId] = useState<number | null>(null);
  const [movements, setMovements] = useState<IMovement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token manquant');
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:3001/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLivreurId(res.data.userId);
      } catch (err) {
        setError('Erreur récupération utilisateur');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (livreurId) fetchMovements();
  }, [livreurId]);

  const fetchMovements = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:3001/movements/user/${livreurId}`);
      setMovements(res.data);
    } catch (err) {
      setError('Erreur chargement des villes');
    }
  };

  const handleToggle = async (city: string, isOrigin: boolean) => {
    if (!livreurId) return;

    const existing = movements.find(
      m => m.city === city && m.isOrigin === isOrigin && m.active
    );

    try {
      if (existing) {
        await axios.patch(`http://127.0.0.1:3001/movements/${existing.id}/deactivate`);
      } else {
        await axios.post(`http://127.0.0.1:3001/movements`, {
          userId: livreurId,
          city,
          isOrigin,
        });
      }
      fetchMovements();
    } catch (err) {
      alert('Erreur mise à jour ville');
    }
  };

  if (!mounted) return null;
  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Mes Villes</h1>

      <div className="mb-6">
        <h2 className="font-semibold">Ville d'origine</h2>
        <div className="flex gap-2 mt-2 flex-wrap">
          {cities.map(city => {
            const active = movements.find(m => m.city === city && m.isOrigin && m.active);
            return (
              <button
                key={city}
                onClick={() => handleToggle(city, true)}
                className={`px-4 py-2 rounded ${
                  active ? 'bg-green-600 text-white' : 'bg-gray-300'
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-semibold">Villes de destination</h2>
        <div className="flex gap-2 mt-2 flex-wrap">
          {cities.map(city => {
            const active = movements.find(m => m.city === city && !m.isOrigin && m.active);
            return (
              <button
                key={city}
                onClick={() => handleToggle(city, false)}
                className={`px-4 py-2 rounded ${
                  active ? 'bg-blue-600 text-white' : 'bg-gray-300'
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
