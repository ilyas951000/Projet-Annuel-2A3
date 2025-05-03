'use client';

import { useState, useEffect, useMemo } from 'react';

interface Document {
  id: number;
  userId: number;
  userStatus: 'livreur' | 'prestataire';
  documentType: string;
  fileName: string;
  fileUrl: string;
}

export default function LivreurDocumentVerification() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [message, setMessage] = useState('');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Récupération des documents pour les livreurs
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://51.15.231.248:3001/admin/documents/livreur', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        });
        if (!res.ok) throw new Error('Erreur récupération');
        setDocuments(await res.json());
      } catch (err) {
        console.error(err);
        setMessage('Impossible de récupérer les documents.');
      }
    })();
  }, []);

  // Grouper par utilisateur
  const groupedByUser = useMemo(() => {
    return documents.reduce<Record<number, { userStatus: string; docs: Document[] }>>(
      (acc, doc) => {
        if (!acc[doc.userId]) acc[doc.userId] = { userStatus: doc.userStatus, docs: [] };
        acc[doc.userId].docs.push(doc);
        return acc;
      },
      {}
    );
  }, [documents]);

  // Accepter tous les docs d'un utilisateur
  const handleAcceptAll = async (userId: number) => {
    try {
      const res = await fetch(
        `http://51.15.231.248:3001/admin/documents/${userId}/accept-all`,
        { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      setMessage(`✅ Tous les documents de l'utilisateur #${userId} ont été acceptés.`);
      setDocuments(prev => prev.filter(d => d.userId !== userId));
      setSelectedUserId(null);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || 'Erreur acceptation.');
    }
  };

  // Refuser (supprimer) tous les docs d'un utilisateur
  const handleRefuseAll = async (userId: number) => {
    try {
      const res = await fetch(
        `http://51.15.231.248:3001/admin/documents/${userId}/refuse-all`,
        { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      setMessage(`❌ Tous les documents de l'utilisateur #${userId} ont été supprimés.`);
      setDocuments(prev => prev.filter(d => d.userId !== userId));
      setSelectedUserId(null);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || 'Erreur suppression.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Vérification des documents pour les livreurs</h1>

      {message && <p className="mb-4 text-sm text-red-600">{message}</p>}

      <div className="space-y-4">
        {Object.entries(groupedByUser).map(([userIdKey, { userStatus, docs }]) => {
          const userId = Number(userIdKey);
          const isOpen = selectedUserId === userId;
          return (
            <div key={userId} className="relative">
              <button
                onClick={() => setSelectedUserId(isOpen ? null : userId)}
                className="w-full text-left p-4 bg-gray-100 rounded flex justify-between items-center hover:bg-gray-200"
              >
                <span>
                  Utilisateur #{userId} — <span className="capitalize">{userStatus}</span>
                </span>
                <span className="text-sm text-gray-600">
                  {docs.length} document{docs.length > 1 ? 's' : ''}
                </span>
              </button>

              {isOpen && (
                <div className="absolute left-0 top-full mt-2 bg-white border rounded shadow-lg w-full z-10">
                  <div className="p-4 flex justify-end space-x-2 border-b">
                    <button
                      onClick={() => handleAcceptAll(userId)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Accepter tout
                    </button>
                    <button
                      onClick={() => handleRefuseAll(userId)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Refuser tout
                    </button>
                  </div>
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 px-3 text-left text-sm">ID</th>
                        <th className="py-2 px-3 text-left text-sm">Type</th>
                        <th className="py-2 px-3 text-left text-sm">Fichier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docs.map(doc => (
                        <tr key={doc.id} className="border-t">
                          <td className="py-2 px-3 text-sm">{doc.id}</td>
                          <td className="py-2 px-3 text-sm">{doc.documentType}</td>
                          <td className="py-2 px-3 text-sm">
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="text-blue-600 hover:underline"
                            >
                              {doc.fileName}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto relative">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-3 right-3 text-red-600 font-bold text-lg"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Aperçu du document</h2>
            <p className="mb-4 text-gray-600">{previewDoc.fileName}</p>
            <div className="border rounded-md overflow-hidden w-full h-[600px] flex justify-center items-center">
              {previewDoc.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.fileName}
                  className="w-full h-full object-contain"
                />
              ) : previewDoc.fileUrl.match(/\.pdf$/i) ? (
                <iframe
                  src={previewDoc.fileUrl}
                  title={previewDoc.fileName}
                  className="w-full h-full"
                />
              ) : (
                <p>Format non supporté.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
