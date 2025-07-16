'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';

type Livreur = {
  id: number;
  userFirstName: string;
  userLastName: string;
  email: string;
  userStatus: string;
};

export default function LivreursDisponiblesPage() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const fetchLivreurs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users?status=livreur`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLivreurs(res.data);
      } catch (error: any) {
        setMessage("Erreur lors de la récupération des livreurs.");
        console.error(error);
      }
    };

    fetchLivreurs();
  }, []);

  const filteredLivreurs = livreurs.filter((livreur) =>
    livreur.userFirstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredLivreurs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedLivreurs = filteredLivreurs.slice(startIndex, startIndex + itemsPerPage);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // reset page
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Livreurs disponibles</h1>

      <input
        type="text"
        placeholder="Rechercher par prénom..."
        className="mb-4 p-2 border rounded w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="itemsPerPage" className="text-sm font-medium">Éléments par page :</label>
        <select
          id="itemsPerPage"
          className="p-2 border rounded"
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {message && <p className="text-red-600">{message}</p>}

      {displayedLivreurs.length === 0 ? (
        <p>Aucun livreur trouvé.</p>
      ) : (
        <ul className="space-y-4">
          {displayedLivreurs.map((livreur) => (
            <li
              key={livreur.id}
              className="border p-4 rounded shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {livreur.userFirstName} {livreur.userLastName}
                </p>
                <p className="text-sm text-gray-600">{livreur.email}</p>
              </div>
              <button
                onClick={() =>
                  router.push(`/dashboard/client/dispoLivreur/${livreur.id}`)
                }
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir les disponibilités
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Controls */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Précédent
        </button>
        <span className="text-sm">
          Page {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
