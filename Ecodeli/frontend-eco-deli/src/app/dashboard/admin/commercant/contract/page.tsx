"use client";

import React, { useEffect, useState } from "react";

interface Commercant {
  id: number;
  userFirstName: string;
  userLastName: string;
  email: string;
  userStatus: string;
}

interface CompanyDetail {
  id: number;
  companyName: string;
  legalStructure: string;
  siren: string;
  dateOfIncorporation: string;
  registeredOfficeAddressStreet: string;
  registeredOfficeAddressCity: string;
  registeredOfficeAddressPostalCode: string;
  startDateOfActivity: string;
  currentYear: string;
}

export default function CommercantsTable() {
  const [commercants, setCommercants] = useState<Commercant[]>([]);
  const [selectedUser, setSelectedUser] = useState<Commercant | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCommercants = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token manquant");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/commercants`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Erreur lors de la récupération des commerçants");
        }

        const data: Commercant[] = await res.json();
        setCommercants(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommercants();
  }, []);

  const fetchCompanyDetails = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company-detail/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la récupération des contrats");
      }

      const data: CompanyDetail[] = await res.json();
      setCompanyDetails(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVoirPlus = (user: Commercant) => {
    setSelectedUser(user);
    fetchCompanyDetails(user.id);
  };
  
  const handleStatusUpdate = async (contractId: number, action: 'accept' | 'reject') => {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company-detail/${contractId}/${action}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });

        if (!res.ok) throw new Error("Échec de la mise à jour du statut");

        // Refresh après action
        if (selectedUser) fetchCompanyDetails(selectedUser.id);
    } catch (err: any) {
        setError(err.message);
    }
    };

    const handleDelete = async (contractId: number) => {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company-detail/${contractId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });

        if (!res.ok) throw new Error("Échec de la suppression");

        if (selectedUser) fetchCompanyDetails(selectedUser.id);
    } catch (err: any) {
        setError(err.message);
    }
    };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Liste des commerçants</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md shadow">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="px-4 py-2 border-b">ID</th>
                <th className="px-4 py-2 border-b">Nom</th>
                <th className="px-4 py-2 border-b">Prénom</th>
                <th className="px-4 py-2 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {commercants.map((user) => (
                <tr key={user.id} className="text-sm text-gray-800 hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{user.id}</td>
                  <td className="px-4 py-2 border-b">{user.userLastName}</td>
                  <td className="px-4 py-2 border-b">{user.userFirstName}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => handleVoirPlus(user)}
                      className="text-blue-600 hover:underline"
                    >
                      Voir plus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-4">Informations détaillées</h2>
            <div className="space-y-2 text-sm text-gray-800">
              <p><strong>ID :</strong> {selectedUser.id}</p>
              <p><strong>Nom :</strong> {selectedUser.userLastName}</p>
              <p><strong>Prénom :</strong> {selectedUser.userFirstName}</p>
              <p><strong>Email :</strong> {selectedUser.email}</p>
              <p><strong>Statut de l'utilisateur actuel :</strong> {selectedUser.userStatus}</p>
            </div>

            <h3 className="text-md font-medium mt-4">Contrats associés :</h3>
            {companyDetails.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun contrat trouvé.</p>
            ) : (
              <ul className="text-sm space-y-2 mt-2">
                {companyDetails.map((contract) => (
                    <li key={contract.id} className="border p-2 rounded bg-gray-50 space-y-1">
                        <p><strong>Entreprise :</strong> {contract.companyName}</p>
                        <p><strong>SIREN :</strong> {contract.siren}</p>
                        <p><strong>Structure :</strong> {contract.legalStructure}</p>
                        <p><strong>Exercice :</strong> {contract.currentYear}</p>
                        <p><strong>Statut :</strong> {contract.status}</p>
                        {contract.status !== 'revolu' ? (
                        <div className="flex space-x-2 mt-2">
                            <button
                            className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleStatusUpdate(contract.id, 'accept')}
                            >
                            Accepter
                            </button>
                            <button
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleStatusUpdate(contract.id, 'reject')}
                            >
                            Refuser
                            </button>
                            <button
                            className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleDelete(contract.id)}
                            >
                            Supprimer
                            </button>
                        </div>
                        ) : (
                        <p className="text-sm text-gray-400 italic mt-2">
                            Aucune action possible (contrat révolu)
                        </p>
                        )}

                    </li>
                    ))}

              </ul>
            )}

            <div className="mt-6 text-right">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setCompanyDetails([]);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
