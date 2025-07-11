"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface IPackage {
  id: number;
  packageName: string;
  packageWeight: number;
  packageDimension: string;
  deliveryStatus: string;
}

export default function TransferValidation() {
  const [packages, setPackages] = useState<IPackage[]>([]);
  const [livreurId, setLivreurId] = useState<number | null>(null);
  const [codes, setCodes] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupère le livreur connecté
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token récupéré du localStorage :", token);

    if (!token) {
      setError("Utilisateur non connecté.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        console.log("Envoi de la requête GET /auth/me...");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Réponse de /auth/me :", res.data);

        if (res.data && res.data.userId) {
          const parsedId = typeof res.data.userId === "string"
            ? parseInt(res.data.userId, 10)
            : res.data.userId;
          console.log("ID livreur détecté :", parsedId);
          if (isMounted) setLivreurId(parsedId);
        } else {
          if (isMounted) setError("Impossible de récupérer l'utilisateur.");
        }
      } catch (err: any) {
        console.error("Erreur lors de /auth/me :", err);
        if (isMounted) setError("Erreur: " + (err.response?.data?.message || err.message));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCurrentUser();
    return () => { isMounted = false; };
  }, []);

  // Fetch des colis à valider
  useEffect(() => {
    if (livreurId !== null) {
      console.log("Déclenchement du fetch des colis à valider pour userId :", livreurId);
      fetchPendingTransfers();
    }
  }, [livreurId]);

  const fetchPendingTransfers = async () => {
    if (livreurId === null || isNaN(Number(livreurId))) {
        console.error("❌ ID du livreur invalide :", livreurId);
        setError("ID du livreur invalide.");
        return;
    }

    try {
        console.log("✅ Requête GET /packages/pending-transfers avec userId =", livreurId);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/packages/pending-transfers`, {
        params: { userId: Number(livreurId) },
        });
        console.log("✅ Colis reçus :", res.data);
        setPackages(res.data);
    } catch (err: any) {
        console.error("❌ Erreur lors du chargement des transferts:", err);
        setError("Erreur lors du chargement des colis à valider.");
    }
    };


  const handleConfirmTransfer = async (packageId: number) => {
    const code = codes[packageId];
    if (!code) {
      alert("Veuillez entrer le code de transfert.");
      return;
    }

    try {
      console.log(`Tentative de validation du colis ${packageId} avec code ${code}`);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}/confirm-transfer`, {
        toCourierId: livreurId,
        code,
      });
      alert("Colis validé !");
      fetchPendingTransfers();
    } catch (err: any) {
      console.error("Erreur lors de la confirmation :", err);
      alert("Erreur : " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📦 Valider les Colis Transférés</h1>

      {packages.length === 0 ? (
        <p>Aucun colis à valider pour l'instant.</p>
      ) : (
        <ul>
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              code={codes[pkg.id] || ""}
              onCodeChange={(value) =>
                setCodes((prev) => ({ ...prev, [pkg.id]: value }))
              }
              onConfirm={() => handleConfirmTransfer(pkg.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ✅ Composant séparé pour lisibilité
function PackageCard({
  pkg,
  code,
  onCodeChange,
  onConfirm,
}: {
  pkg: IPackage;
  code: string;
  onCodeChange: (val: string) => void;
  onConfirm: () => void;
}) {
  return (
    <li className="border p-4 mb-4 rounded shadow">
      <h2 className="text-lg font-semibold">{pkg.packageName}</h2>
      <p><strong>Poids :</strong> {pkg.packageWeight} kg</p>
      <p><strong>Dimension :</strong> {pkg.packageDimension}</p>
      <p><strong>Statut actuel :</strong> {pkg.deliveryStatus}</p>

      <input
        type="text"
        className="border p-1 mt-2 w-full"
        placeholder="Code de transfert"
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
      />

      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={!code}
        onClick={onConfirm}
      >
        Valider ce colis
      </button>
    </li>
  );
}
