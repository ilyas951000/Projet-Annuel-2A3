"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://51.15.231.248:3001";

export default function ModifierAnnonce({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [annonce, setAnnonce] = useState({ titre: "", description: "" });

  useEffect(() => {
    fetch(`${API_URL}/annonces/${params.id}`)
      .then((res) => res.json())
      .then(setAnnonce);
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAnnonce({ ...annonce, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_URL}/annonces/${params.id}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annonce),
    });
    router.push("/dashboard/admin/advertisementManagement/annonces");
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">Modifier l'annonce</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Titre</label>
          <input 
            type="text" 
            name="titre" 
            value={annonce.titre} 
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">Description</label>
          <textarea 
            name="description" 
            value={annonce.description} 
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          ✅ Sauvegarder
        </button>
      </form>
    </div>
  );
}
