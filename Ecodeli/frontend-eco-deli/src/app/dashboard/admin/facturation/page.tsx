"use client";
import { useState } from "react";

export default function AdminFacturationPage() {
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const generate = async () => {
    if (!month || !year) {
      return alert("Veuillez choisir un mois et une année.");
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/invoices/admin/generate-summary?month=${month}&year=${year}`;
      window.open(url, "_blank");
      setMessage("✅ Facture en cours de téléchargement.");
    } catch (err) {
      setMessage("❌ Erreur lors de la génération.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">🧾 Facturation Mensuelle (Admin)</h1>

      <div className="flex gap-4 mb-4">
        <input
          type="number"
          placeholder="Mois (1-12)"
          min="1"
          max="12"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-2 py-1 rounded w-1/2"
        />
        <input
          type="number"
          placeholder="Année (ex: 2025)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border px-2 py-1 rounded w-1/2"
        />
      </div>

      <button
        onClick={generate}
        className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
      >
        Télécharger la facturation PDF
      </button>

      {message && <p className="mt-4 text-center text-blue-600">{message}</p>}
    </div>
  );
}
