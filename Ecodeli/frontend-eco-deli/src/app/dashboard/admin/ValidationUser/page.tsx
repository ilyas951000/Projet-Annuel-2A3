'use client';

import { useState, useEffect } from 'react';

interface Document {
  id: number;
  userId: number;
  fileName: string;
  fileUrl: string;
  documentValid: 'yes' | 'no' | 'undetermined';
  requirementId: number;
}

interface Requirement {
  id: number;
  name: string;
}

interface UserDocumentsGrouped {
  [userId: number]: {
    documents: Document[];
    requirements: Requirement[];
  };
}

export default function AdminDocumentVerification() {
  const [grouped, setGrouped] = useState<UserDocumentsGrouped>({});
  const [message, setMessage] = useState('');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const [docRes, reqRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/documents/prestataire`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/requirements/by-user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const documents: Document[] = await docRes.json();
        const requirementsByUser: { [userId: number]: Requirement[] } = await reqRes.json();

        const groupedData: UserDocumentsGrouped = {};

        documents.forEach((doc) => {
          if (!groupedData[doc.userId]) {
            groupedData[doc.userId] = {
              documents: [],
              requirements: requirementsByUser[doc.userId] || [],
            };
          }
          groupedData[doc.userId].documents.push(doc);
        });

        setGrouped(groupedData);
      } catch (err) {
        setMessage('Erreur réseau lors du chargement des données.');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleValidation = async (doc: Document, action: 'accept' | 'refuse') => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/documents/${doc.id}/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      if (res.ok) {
        setGrouped((prev) => {
          const updated = { ...prev };
          updated[doc.userId].documents = updated[doc.userId].documents.map((d) =>
            d.id === doc.id ? { ...d, documentValid: action === 'accept' ? 'yes' : 'no' } : d
          );
          return updated;
        });
      } else {
        setMessage("Erreur lors de la validation du document.");
      }
    } catch (err) {
      console.error(err);
      setMessage('Erreur réseau lors de la validation.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Vérification des documents (Prestataires)</h1>

      {message && <div className="mb-4 text-sm text-red-600">{message}</div>}

      {Object.entries(grouped).map(([userIdStr, { documents, requirements }]) => {
        const userId = parseInt(userIdStr, 10);
        const sentReqIds = new Set(documents.map((d) => d.requirementId));

        return (
          <div key={userId} className="mb-10 border rounded p-4 bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Utilisateur #{userId}</h2>

            <h3 className="font-medium mb-2">Documents reçus :</h3>
            <table className="w-full mb-4 border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">Nom</th>
                  <th className="border px-3 py-2">Statut</th>
                  <th className="border px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="border px-3 py-2">{doc.fileName}</td>
                    <td className="border px-3 py-2">
                      {doc.documentValid === 'yes' ? '✅ Accepté' : doc.documentValid === 'no' ? '❌ Refusé' : '⏳ En attente'}
                    </td>
                    <td className="border px-3 py-2 space-x-2">
                      <button className="text-blue-600 underline" onClick={() => setPreviewDoc(doc)}>
                        Voir
                      </button>
                      <button className="text-green-600" onClick={() => handleValidation(doc, 'accept')}>
                        Accepter
                      </button>
                      <button className="text-red-600" onClick={() => handleValidation(doc, 'refuse')}>
                        Refuser
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-3 right-3 text-red-600 font-bold text-lg"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-2">Aperçu du document</h2>
            <iframe src={previewDoc.fileUrl} className="w-full h-[500px]" />
          </div>
        </div>
      )}
    </div>
  );
}
