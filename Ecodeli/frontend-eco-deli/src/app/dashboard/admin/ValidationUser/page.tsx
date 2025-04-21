'use client';

import { useState, useEffect } from "react";

// Interface représentant le document tel que renvoyé par ton API
interface Document {
  id: number;
  userId: number;
  // On suppose que l'API renvoie aussi le statut de l'utilisateur (livreur ou prestataire)
  userStatus: "livreur" | "prestataire";
  // Autres propriétés, par exemple le nom de fichier, type, etc.
  fileName: string;
}

export default function AdminDocumentVerification() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [message, setMessage] = useState("");

  // Chargement des documents depuis le backend
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("http://127.0.0.1:3001/admin/documents", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        if (res.ok) {
          const data: Document[] = await res.json();
          setDocuments(data);
        } else {
          setMessage("Erreur lors de la récupération des documents.");
        }
      } catch (error) {
        console.error("Erreur de chargement :", error);
        setMessage("Erreur de réseau lors du chargement des documents.");
      }
    };

    fetchDocuments();
  }, []);

  // Fonction pour envoyer la validation/refus au backend
  const handleValidation = async (doc: Document, action: "accept" | "refuse") => {
    try {
      const res = await fetch(
        `http://127.0.0.1:3001/admin/documents/${doc.id}/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      if (res.ok) {
        setMessage("Action effectuée avec succès.");
        // Retirer du tableau le document traité
        setDocuments((prevDocs) => prevDocs.filter((d) => d.id !== doc.id));
      } else {
        const errorData = await res.json();
        setMessage(`Erreur : ${errorData.message || "Échec lors de la validation"}`);
      }
    } catch (error) {
      console.error("Erreur lors de la validation :", error);
      setMessage("Erreur de réseau ou serveur lors de la validation.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vérification des Documents</h1>
      {message && <div className="mb-4 text-red-600">{message}</div>}
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Document ID</th>
            <th className="py-2 px-4 border">User ID</th>
            <th className="py-2 px-4 border">User Status</th>
            <th className="py-2 px-4 border">Nom du fichier</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="py-2 px-4 border">{doc.id}</td>
              <td className="py-2 px-4 border">{doc.userId}</td>
              <td className="py-2 px-4 border">{doc.userStatus}</td>
              <td className="py-2 px-4 border">{doc.fileName}</td>
              <td className="py-2 px-4 border">
                <button
                  className="bg-green-600 text-white px-3 py-1 mr-2 rounded hover:bg-green-700 transition"
                  onClick={() => handleValidation(doc, "accept")}
                >
                  Accepter
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  onClick={() => handleValidation(doc, "refuse")}
                >
                  Refuser
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
