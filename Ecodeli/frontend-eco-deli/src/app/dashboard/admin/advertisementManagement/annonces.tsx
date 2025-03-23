"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "http://51.15.231.248:3001";

export default function Annonces() {
  const [annonces, setAnnonces] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/annonces-pending`)
      .then((res) => res.json())
      .then(setAnnonces);
  }, []);

  const handleValidation = async (id: number) => {
    await fetch(`${API_URL}/annonces/${id}/validate`, { method: "POST" });
    setAnnonces(annonces.filter((annonce) => annonce.id_annonce !== id));
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/annonces/${id}/delete`, { method: "POST" });
    setAnnonces(annonces.filter((annonce) => annonce.id_annonce !== id));
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">Annonces en attente</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Titre</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {annonces.map((annonce) => (
            <tr key={annonce.id_annonce} className="text-center">
              <td className="border p-2">{annonce.id_annonce}</td>
              <td className="border p-2">{annonce.titre}</td>
              <td className="border p-2 flex justify-center space-x-2">
                <button 
                  className="bg-green-500 text-white px-3 py-1 rounded" 
                  onClick={() => handleValidation(annonce.id_annonce)}
                >
                  ✅ Valider
                </button>
                <Link href={`/dashboard/admin/advertisementManagement/modifier-annonce/${annonce.id_annonce}`}>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded">
                    ✏️ Modifier
                  </button>
                </Link>
                <button 
                  className="bg-red-500 text-white px-3 py-1 rounded" 
                  onClick={() => handleDelete(annonce.id_annonce)}
                >
                  🗑 Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
