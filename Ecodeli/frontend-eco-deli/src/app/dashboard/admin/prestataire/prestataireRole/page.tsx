'use client';

import { useState } from 'react';
import axios from 'axios';

export default function CreatePrestataireRolePage() {
  const [roleName, setRoleName] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceMin, setPriceMin] = useState<number | ''>('');
  const [priceMax, setPriceMax] = useState<number | ''>('');


  const handleAddRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const handleRequirementChange = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const handleSubmit = async () => {
    if (!roleName.trim()) return alert('Le nom du rôle est requis.');
    setIsSubmitting(true);

    try {
      // Envoie 1 seule requête avec nom + exigences
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/prestataire-roles`,
        {
          name: roleName,
          requirements: requirements.filter((r) => r.trim() !== ''),
          priceMin,
          priceMax,
        }
      );

      alert('Rôle créé avec succès !');
      setRoleName('');
      setRequirements(['']);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création du rôle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Créer un rôle prestataire</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">Nom du rôle</label>
        <input
          type="text"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Ex : Chauffeur, Plombier..."
        />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-4">
      <div>
        <label className="block font-medium mb-1">Prix min (€)</label>
        <input
          type="number"
          value={priceMin}
          onChange={(e) => setPriceMin(Number(e.target.value))}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Ex : 50"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Prix max (€)</label>
        <input
          type="number"
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Ex : 200"
        />
      </div>
    </div>


      <div className="mb-4">
        <label className="block font-medium mb-2">Documents requis</label>
        {requirements.map((req, idx) => (
          <input
            key={idx}
            type="text"
            value={req}
            onChange={(e) => handleRequirementChange(idx, e.target.value)}
            className="w-full mb-2 border border-gray-300 rounded px-3 py-2"
            placeholder={`Document ${idx + 1}`}
          />
        ))}
        <button
          type="button"
          onClick={handleAddRequirement}
          className="text-blue-600 hover:underline text-sm mt-2"
        >
          + Ajouter un document requis
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4"
      >
        {isSubmitting ? 'Création en cours...' : 'Créer le rôle'}
      </button>
    </div>
  );
}
