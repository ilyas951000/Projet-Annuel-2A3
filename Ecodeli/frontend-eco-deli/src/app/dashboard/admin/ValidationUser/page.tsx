"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: number;
  userFirstName: string;
  userLastName: string;
  userRole: string;
  justificationDocument?: {
    id: number;
    fileName: string;
  } | null;
}

export default function ValidationUserPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Récupère les utilisateurs en attente (valid == false)
    fetch("http://51.15.231.248:3001/users/pending")
      .then((res) => res.json())
      .then((data) => {
        console.log("Données récupérées :", data);
        setUsers(data);
      })
      .catch((error) => console.error("Erreur de chargement :", error));
  }, []);

  const handleValidation = async (user: User) => {
    // Afficher l'objet user dans la console pour vérifier sa structure
    console.log("Utilisateur passé à handleValidation :", user);

    if (!user || !user.userRole) {
      console.error("Utilisateur ou rôle manquant :", user);
      return;
    }

    let updateField = "";
    // Déterminer quel champ mettre à jour en fonction du rôle
    if (user.userRole.toLowerCase() === "livreur") {
      updateField = "occasionalCourier"; // Champ à mettre à jour pour un livreur
    } else {
      updateField = "valid"; // Champ à mettre à jour pour les autres rôles
    }

    try {
      // Effectuer la requête PATCH avec le champ adéquat
      const response = await fetch(`http://51.15.231.248:3001/users/${user.id}/validate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [updateField]: 1 }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la validation");
      }
      // Mettre à jour l'interface en retirant l'utilisateur validé
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error("Erreur lors de la requête de validation :", error);
    }
  };

  const handleRejection = async (id: number) => {
    try {
      const response = await fetch(`http://51.15.231.248:3001/users/${id}/reject`, {
        method: "PATCH",
      });
      if (!response.ok) {
        throw new Error("Erreur lors du rejet");
      }
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Erreur lors de la requête de rejet :", error);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-semibold">Validation des justificatifs</h1>
      {users.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {users.map((user) => {
            // Log pour vérifier la structure de chaque utilisateur lors du rendu
            console.log("Rendu utilisateur :", user);
            return (
              <li key={user.id} className="border p-3 rounded-md">
                <div>
                  <strong>
                    {user.userFirstName} {user.userLastName}
                  </strong>{" "}
                  ({user.userRole})
                </div>
                <div>
                  {user.justificationDocument ? (
                    <>
                      📄{" "}
                      <a
                        href={`http://51.15.231.248:3001/uploads/${user.justificationDocument.fileName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        Télécharger
                      </a>
                    </>
                  ) : (
                    <>❌ Aucun justificatif</>
                  )}
                </div>
                <div className="mt-2 space-x-3">
                  <button
                    onClick={() => handleValidation(user)}
                    className="px-3 py-1 bg-green-500 text-white rounded-md"
                  >
                    ✅ Valider
                  </button>
                  <button
                    onClick={() => handleRejection(user.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md"
                  >
                    ❌ Refuser
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Aucun justificatif en attente.</p>
      )}
      <div className="mt-5">
        <Link href="/dashboard/admin" className="text-blue-500 underline">
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
