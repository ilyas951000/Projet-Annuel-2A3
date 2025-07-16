"use client";
import '../globals.css';
import { useEffect, useState } from "react";
import { PlusCircle, Menu, X, Moon, Sun, Router } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"


interface Ad {
  id: number;
  usersId: number;
  advertisementPhoto?: string;
  advertisementQuantity: number;
  advertisementItem: string;
  publicationDate: string;
  advertisementDimension?: string;
  advertisementWeight?: number;
  additionalInformation?: string;
  advertisementPrice: number;
  advertisementStatus?: string;
}

export default function OtherAnnouncements() {
  const router = useRouter()

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetReady, setTargetReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [adsPerPage, setAdsPerPage] = useState(5);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token manquant");
        const res = await fetch("http://localhost:3001/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur récupération utilisateur");
        const { userId } = await res.json();
        setUserId(userId);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId === null) return;
    const fetchOthers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/advertisements/others", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        setAds(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOthers();
  }, [userId]);

  
  const totalPages = Math.ceil(ads.length / adsPerPage);
  const indexOfLastAd = currentPage * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = ads.slice(indexOfFirstAd, indexOfLastAd);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleAdsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAdsPerPage(Number(e.target.value));
    setCurrentPage(1); // reset to first page
  };




  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-5 md:p-10 overflow-visible w-full relative z-0">
          <div className="flex justify-between items-center md:hidden mb-5">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
            <button
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-900" />}
            </button>
          </div>

          <h2
            className="text-3xl font-semibold text-gray-900 dark:text-white mb-6"
            
          >
            Les annonces des autres utilisateurs
          </h2>

          {loading ? (
            <p>Chargement des annonces…</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Vous pouvez voir les annonces des autres utilisateurs :
              </p>
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Objet</th>
                    <th className="px-4 py-2">Prix (€)</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAds.map((ad) => (
                    <tr key={ad.id} className="border-t border-gray-200 dark:border-gray-600">
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                        {ad.advertisementPhoto && (
                          <Image
                            src={`http://localhost:3001/uploads/${ad.advertisementPhoto}`}
                            alt="Annonce"
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                          />
                        )}
                        <span>{ad.advertisementItem}</span>
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {ad.advertisementPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {new Date(ad.publicationDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-2">
                        <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => router.push(`/dashboard/client/announcementPage/${ad.id}`)}

                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm mr-3"
                        >
                          🔍 Voir plus de détails
                        </button>
                      </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <label htmlFor="adsPerPage" className="mr-2 text-sm text-gray-700 dark:text-gray-300">Annonces par page:</label>
                  <select
                    id="adsPerPage"
                    value={adsPerPage}
                    onChange={handleAdsPerPageChange}
                    className="border border-gray-300 dark:border-gray-600 rounded p-1"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                <div className="space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </main>

        


        <style jsx global>{`
          .spotlight {
            position: relative;
            z-index: 9999;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
            border-radius: 8px;
            transition: box-shadow 0.3s ease;
          }

          .spotlight::after {
            content: '';
            position: absolute;
            top: -8px;
            left: -8px;
            right: -8px;
            bottom: -8px;
            border: 2px solid rgba(255, 255, 255, 0.8);
            border-radius: 10px;
            animation: pulse 1.5s infinite;
            pointer-events: none;
          }

          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.1); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}

function NavItem({ title, link }: { title: string; link: string }) {
  return (
    <li className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md">
      <PlusCircle className="w-4 h-4" />
      <Link href={link}>{title}</Link>
    </li>
  );
}
