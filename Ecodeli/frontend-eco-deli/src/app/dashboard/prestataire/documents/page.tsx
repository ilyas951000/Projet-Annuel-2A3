'use client';

import { useState } from 'react';

const DOCUMENT_TYPES = [
  'CNI',
  'Permis de conduire',
  'Passeport',
  'RIB',
  'Justificatif de domicile',
  'Autre',
];

type DocumentForm = {
  documentType: string;
  documentDate: string;
  expirationDate: string;
  format: string;
  file: File | null;
};

export default function JustificationPage() {
  const [documents, setDocuments] = useState<DocumentForm[]>([
    { documentType: '', documentDate: '', expirationDate: '', format: '', file: null },
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, field: keyof DocumentForm, value: any) => {
    const updated = [...documents];
    updated[index][field] = value;
    setDocuments(updated);
  };

  const addDocumentForm = () => {
    setDocuments([...documents, { documentType: '', documentDate: '', expirationDate: '', format: '', file: null }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('documents', JSON.stringify(
      documents.map((d) => ({
        documentType: d.documentType,
        documentDate: d.documentDate,
        expirationDate: d.expirationDate,
        format: d.format,
      }))
    ));

    documents.forEach((d) => d.file && formData.append('file', d.file));

    try {
      const res = await fetch('http://51.15.231.248:3001/documents/multi-upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Tous les justificatifs ont été envoyés !');
        setDocuments([{ documentType: '', documentDate: '', expirationDate: '', format: '', file: null }]);
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
              value={doc.documentType}
              onChange={(e) => handleChange(i, 'documentType', e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Type de document</option>
              {DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <input type="date" value={doc.documentDate} onChange={(e) => handleChange(i, 'documentDate', e.target.value)} className="w-full p-2 border rounded" required />
            <input type="date" value={doc.expirationDate} onChange={(e) => handleChange(i, 'expirationDate', e.target.value)} className="w-full p-2 border rounded" required />
            <input type="text" placeholder="Format (PDF, JPG...)" value={doc.format} onChange={(e) => handleChange(i, 'format', e.target.value)} className="w-full p-2 border rounded" required />
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleChange(i, 'file', e.target.files?.[0] || null)} className="w-full p-2 border rounded" required />
          </div>
        ))}
        <button type="button" onClick={addDocumentForm} className="text-blue-600 underline text-sm">+ Ajouter un autre justificatif</button>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-4">{loading ? 'Envoi...' : 'Envoyer tous les documents'}</button>
      </form>
      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
    </div>
);
}
