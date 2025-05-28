'use client';

import { useState, useEffect } from 'react';

interface Document {
  id: number;
  userId: number;
  userStatus: 'livreur' | 'prestataire';
  fileName: string;
  fileUrl: string;
  documentValid: 'yes' | 'no' | 'undetermined';
}

type GroupedDocuments = {
  [userId: number]: Document[];
};

// ... même imports
export default function AdminDocumentVerification() {
  const [groupedDocuments, setGroupedDocuments] = useState<GroupedDocuments>({});
  const [message, setMessage] = useState('');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // 🟡 Récupération initiale
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/documents/prestataire`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });

        if (res.ok) {
          const data: Document[] = await res.json();
          const grouped: GroupedDocuments = {};
          data.forEach((doc) => {
            if (!grouped[doc.userId]) grouped[doc.userId] = [];
            grouped[doc.userId].push(doc);
          });
          setGroupedDocuments(grouped);
        } else {
          setMessage('Erreur lors de la récupération des documents.');
        }
      } catch (err) {
        console.error('Erreur réseau :', err);
        setMessage('Impossible de contacter le serveur.');
      }
    };

    fetchDocuments();
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
        setMessage(`Document ${action === 'accept' ? 'accepté' : 'refusé'} avec succès.`);
        setGroupedDocuments((prev) => {
          const updated = { ...prev };
          updated[doc.userId] = updated[doc.userId].map((d) =>
            d.id === doc.id ? { ...d, documentValid: action === 'accept' ? 'yes' : 'no' } : d
          );
          return updated;
        });
      } else {
        const errData = await res.json();
        setMessage(errData.message || 'Erreur serveur lors de la validation.');
      }
    } catch (err) {
      console.error('Erreur validation :', err);
      setMessage('Erreur réseau lors de la validation.');
    }
  };

  const handleAcceptAll = async (userId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/documents/${userId}/accept-all`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );

      if (res.ok) {
        setMessage(`Tous les documents de l'utilisateur #${userId} ont été acceptés.`);
        setGroupedDocuments((prev) => {
          const updated = { ...prev };
          updated[userId] = updated[userId].map((doc) => ({
            ...doc,
            documentValid: 'yes',
          }));
          return updated;
        });
      } else {
        const errData = await res.json();
        setMessage(errData.message || 'Erreur lors de l’acceptation groupée.');
      }
    } catch (err) {
      console.error('Erreur acceptation groupée :', err);
      setMessage('Erreur réseau lors de l’acceptation groupée.');
    }
  };

  const handlePreview = (doc: Document) => {
    setPreviewDoc(doc);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Vérification des documents (Prestataires)</h1>

      {message && <div className="mb-4 text-sm text-red-600">{message}</div>}

      {Object.entries(groupedDocuments).map(([userIdStr, docs]) => {
        const userId = parseInt(userIdStr, 10);
        return (
          <div key={userId} className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Utilisateur #{userId}</h2>
              <button
                onClick={() => handleAcceptAll(userId)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Accepter tous les documents
              </button>
            </div>
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border">ID</th>
                  <th className="py-2 px-4 border">Fichier</th>
                  <th className="py-2 px-4 border">Actions</th>
                  <th className="py-2 px-4 border">État</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td className="py-2 px-4 border">{doc.id}</td>
                    <td className="py-2 px-4 border capitalize">
                      {doc.documentValid === 'yes'
                        ? '✅ Accepté'
                        : doc.documentValid === 'no'
                        ? '❌ Refusé'
                        : '⏳ En attente'}
                    </td>
                    <td className="py-2 px-4 border">
                      <button onClick={() => handlePreview(doc)} className="text-blue-600 hover:underline">
                        {doc.fileName}
                      </button>
                    </td>
                    <td className="py-2 px-4 border space-x-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        onClick={() => handleValidation(doc, 'accept')}
                      >
                        Accepter
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        onClick={() => handleValidation(doc, 'refuse')}
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
      })}

      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-3 right-3 text-red-600 font-bold text-lg"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Aperçu du document</h2>
            <p className="mb-4 text-gray-600">{previewDoc.fileName}</p>

            <div className="border rounded-md overflow-hidden w-full h-[600px] flex items-center justify-center">
              {previewDoc.fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={previewDoc.fileUrl} alt={previewDoc.fileName} className="w-full h-full object-contain" />
              ) : previewDoc.fileUrl?.match(/\.pdf$/i) ? (
                <iframe src={previewDoc.fileUrl} title={previewDoc.fileName} className="w-full h-full" />
              ) : (
                <p>Format non supporté ou lien invalide.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
