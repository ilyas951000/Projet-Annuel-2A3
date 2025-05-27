"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminAnnonceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [annonce, setAnnonce] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur de chargement de l'annonce");
        setAnnonce(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonce();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce et ses colis ?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");
      alert("Annonce supprimée avec succès");
      router.push("/dashboard/admin/annonces");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-600">Erreur : {error}</p>;
  if (!annonce) return <p>Annonce introuvable.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow space-y-4">
      <h1 className="text-2xl font-bold">Annonce #{annonce.id}</h1>

      <div className="space-y-2">
        <p className="font-medium">Photo de l'annonce</p>
        {annonce.advertisementPhoto ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${annonce.advertisementPhoto}`}
            alt="Annonce"
            className="w-full max-w-md rounded"
          />
        ) : (
          <p className="text-gray-500">Aucune photo</p>
        )}

        <p>Publié le : {new Date(annonce.publicationDate).toLocaleDateString("fr-FR")}</p>
        <p>Début : {annonce.advertisementBeginning || "N/A"}</p>
        <p>Fin : {annonce.advertisementEnd || "N/A"}</p>
        <p>Prix : {annonce.advertisementPrice ?? "N/A"} €</p>
        <p>Status : {annonce.advertisementStatus || "N/A"}</p>
        <p>Validée : {annonce.isValidated ? "Oui" : "Non"}</p>
        <p>Rôle du créateur : {annonce.creatorRole || "N/A"}</p>

        <h2 className="text-lg font-semibold mt-4">Utilisateur</h2>
        {annonce.users ? (
          <div>
            <p>{annonce.users.userFirstName} {annonce.users.userLastName}</p>
            <p>{annonce.users.email}</p>
          </div>
        ) : (
          <p className="text-gray-500">Aucun utilisateur associé</p>
        )}

        <h2 className="text-lg font-semibold mt-4">Colis associés</h2>
        {annonce.packages?.length > 0 ? (
          annonce.packages.map((pkg: any) => (
            <div key={pkg.id} className="bg-gray-50 p-3 rounded mb-2">
              <p><strong>Objet :</strong> {pkg.packageName}</p>
              <p><strong>Quantité :</strong> {pkg.packageQuantity}</p>
              <p><strong>Poids :</strong> {pkg.packageWeight} kg</p>
              <p><strong>Dimensions :</strong> {pkg.packageDimension}</p>
              <p><strong>Trajet :</strong> {pkg.localisations?.[0]?.currentCity} → {pkg.localisations?.[0]?.destinationCity}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aucun colis associé</p>
        )}
      </div>

      <div className="flex justify-between items-center mt-6">
        <Link
          href="/dashboard/admin/annonces"
          className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          ← Retour aux annonces
        </Link>

        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Supprimer l'annonce
        </button>
      </div>
    </div>
  );
}
