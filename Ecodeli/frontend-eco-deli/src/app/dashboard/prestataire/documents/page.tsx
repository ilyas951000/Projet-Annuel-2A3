'use client';

import { useState } from 'react';

export default function JustificationPage() {
  const [documentType, setDocumentType] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [format, setFormat] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage('Veuillez sélectionner un fichier.');
      return;
    }

    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('documentDate', documentDate);
    formData.append('expirationDate', expirationDate);
    formData.append('format', format);
    formData.append('file', file);

    try {
      const res = await fetch('http://51.15.231.248:3001/documents/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: formData,
      });

      if (res.ok) {
        setMessage('Justificatif envoyé avec succès !');
      } else {
        const errorData = await res.json();
        setMessage(`Erreur : ${errorData.message || 'Échec de l\'envoi'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi', error);
      setMessage('Erreur de réseau ou serveur.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Déposer un justificatif</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Type de document (ex: CNI)"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="date"
          placeholder="Date du document"
          value={documentDate}
          onChange={(e) => setDocumentDate(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="Format (ex: PDF, JPG)"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="date"
          placeholder="Date d'expiration"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Envoyer
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
    </div>
  );
}
