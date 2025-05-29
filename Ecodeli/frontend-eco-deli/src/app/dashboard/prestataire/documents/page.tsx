'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// Autres imports nécessaires...

type UserData = {
  userId: number;
  userStatus: string;
  valid: boolean;
  prestataireRoleId: number;
};

type Requirement = {
  id: number;
  name: string;
};

type DocumentForm = {
  requirementId: number;
  name: string;
  documentDate: string;
  expirationDate: string;
  format: string;
  file: File | null;
};

type JustificationFormProps = {
  requirements: Requirement[];
};

function JustificationForm({ requirements }: JustificationFormProps) {
  const [documents, setDocuments] = useState<DocumentForm[]>([
    { requirementId: 0, name: '', documentDate: '', expirationDate: '', format: '', file: null },
  ]);




  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, field: keyof DocumentForm, value: any) => {
    const updated = [...documents];
    updated[index][field] = value;
    setDocuments(updated);
  };

  const addDocumentForm = () => {
  if (documents.length < requirements.length) {
    setDocuments([
      ...documents,
      { requirementId: 0, name: '', documentDate: '', expirationDate: '', format: '', file: null },
    ]);
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append(
      'documents',
      JSON.stringify(
        documents.map((d) => ({
          requirementId: d.requirementId,
          documentDate: d.documentDate,
          expirationDate: d.expirationDate,
          format: d.format,
        }))
      )
    );


    documents.forEach((d) => d.file && formData.append('file', d.file));

    try {
      const res = await fetch('http://localhost:3001/documents/multi-upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Tous les justificatifs ont été envoyés !');
        setDocuments([
          { documentType: '', documentDate: '', expirationDate: '', format: '', file: null },
        ]);
      } else {
        setMessage(`❌ Erreur : ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Erreur réseau ou serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Déposer plusieurs justificatifs</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {documents.map((doc, i) => (
          <div key={i} className="p-4 border rounded space-y-4">
            <select
              value={doc.requirementId}
              onChange={(e) =>
                handleChange(i, 'requirementId', parseInt(e.target.value))
              }
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Type de document</option>
              {requirements.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={doc.documentDate}
              onChange={(e) => handleChange(i, 'documentDate', e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="date"
              value={doc.expirationDate}
              onChange={(e) => handleChange(i, 'expirationDate', e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Format (PDF, JPG...)"
              value={doc.format}
              onChange={(e) => handleChange(i, 'format', e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleChange(i, 'file', e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        ))}
        <div className="relative inline-block group">
          <button
            type="button"
            onClick={addDocumentForm}
            className={`text-sm underline ${
              documents.length >= requirements.length
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600'
            }`}
            disabled={documents.length >= requirements.length}
          >
            + Ajouter un autre justificatif
          </button>

          {documents.length >= requirements.length && (
            <div className="absolute z-10 -top-8 left-0 w-max bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
              brother t'es déjà au max peut plus rien faire pour toi
            </div>
          )}
        </div>


        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-4"
        >
          {loading ? 'Envoi...' : 'Envoyer tous les documents'}
        </button>
        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
      </form>
    </div>
  );
}

const AdminConnexion = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:3001/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = res.data;
        setUserData(user);

        const requirementsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/prestataire-requirements/by-role/${user.prestataireRoleId}`
        );
        setRequirements(requirementsRes.data);
      } catch (err) {
        console.error('Erreur API :', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (!userData) return <p>Utilisateur non connecté</p>;

  if (!userData.valid) {
    return (
      <div className="space-y-6 p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Documents requis pour validation</h1>
        <ul className="list-disc pl-5 text-gray-700">
          {requirements.map((r) => (
            <li key={r.id}>{r.name}</li>
          ))}
        </ul>
        <JustificationForm requirements={requirements} />

      </div>
    );
  }

  return <p className="text-center mt-10">Bienvenue, vous êtes validé ✅</p>;
};

export default AdminConnexion;
