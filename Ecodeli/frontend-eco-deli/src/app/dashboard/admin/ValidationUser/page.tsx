'use client';

import { useState, useEffect } from 'react';

// Interface pour le document
interface Document {
  id: number;
  userId: number;
  userStatus: 'livreur' | 'prestataire';
  fileName: string;
  fileUrl: string; // ✅ URL générée par le backend
}

export default function AdminDocumentVerification() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [message, setMessage] = useState('');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // 🟡 Récupération des documents à la connexion
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("http://127.0.0.1:3001/admin/documents", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });

        if (res.ok) {
          const data: Document[] = await res.json();
          setDocuments(data);
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

  // ✅ Validation ou refus d’un document
  const handleValidation = async (doc: Document, action: 'accept' | 'refuse') => {
    try {
      const res = await fetch(
        `http://51.15.231.248:3001/admin/documents/${doc.id}/validate`,
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
        setMessage(`Document ${action === 'accept' ? 'accepté' : 'refusé'} avec succès.`);
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      } else {
        const errData = await res.json();
        setMessage(errData.message || 'Erreur serveur lors de la validation.');
      }
    } catch (err) {
      console.error('Erreur validation :', err);
      setMessage('Erreur réseau lors de la validation.');
    }
  };

  // 🔍 Ouvre le preview
  const handlePreview = (doc: Document) => {
    setPreviewDoc(doc);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Vérification des documents</h1>

      {message && <div className="mb-4 text-sm text-red-600">{message}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border">ID</th>
              <th className="py-2 px-4 border">Utilisateur</th>
              <th className="py-2 px-4 border">Statut</th>
              <th className="py-2 px-4 border">Fichier</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="py-2 px-4 border">{doc.id}</td>
                <td className="py-2 px-4 border">{doc.userId}</td>
                <td className="py-2 px-4 border capitalize">{doc.userStatus}</td>
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

      {/* 🖼️ Modal de preview */}
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
