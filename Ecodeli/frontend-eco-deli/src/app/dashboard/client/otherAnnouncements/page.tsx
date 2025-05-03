"use client"

import { useEffect, useState } from "react";
import { PlusCircle, Menu, X, Moon, Sun, User, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Récupérer l’ID du user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token manquant");
        const res = await fetch('http://127.0.0.1:3001/auth/me', {
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

  // 2. Dès qu’on a userId, on récupère les annonces des autres
  useEffect(() => {
    if (userId === null) return;
    const fetchOthers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://127.0.0.1:3001/advertisements/others', {
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

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <aside
          className={`fixed z-40 top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 p-5 flex-col justify-between transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex`}
        >
          <div>
            <div className="flex justify-between items-center md:hidden mb-6">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">EcoDeli</h1>
              <button onClick={() => setSidebarOpen(false)}><X className="text-gray-700 dark:text-white" /></button>
            </div>

            <Link href="/connexion" className="bg-green-600 px-4 py-2 rounded-lg text-black font-semibold inline-block mb-4">
              <Image src="/logo1.png" alt="EcoDeli Logo" width={120} height={20} className="h-10 w-auto" />
            </Link>

            <nav className="mt-5">
                <ul className="space-y-3">
                  <NavItem title="Accueil" link="../client" />
                  <NavItem title="Mes Annonces" link="./announcements" />
                  <NavItem title="Annonces des Autres" link="./otherAnnouncements" />
                  <NavItem title="Suivi des Livraisons" link="/suivi-livraisons" />
                  <NavItem title="Mes Paiements" link="/paiements" />
                  <NavItem title="Abonnement" link="./subscription" />
                  <NavItem title="Services & Prestataires" link="/services" />
                  <NavItem title="Profil / Compte" link="/compte" />
                </ul>
            </nav>

            <div className="mt-10 space-y-3">
              <NavItem title="À propos" link="/a-propos" />
              <NavItem title="Nous contacter" link="/contact" />
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-10">
            <User className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-300">Mon compte</span>
            <Settings className="w-5 h-5 text-gray-500 dark:text-gray-300 cursor-pointer" />
          </div>
        </aside>

        <main className="flex-1 p-5 md:p-10 overflow-auto w-full">
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

          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
            Les annonces des autres utilisateurs
          </h2>

          {loading ? (
            <p>Chargement des annonces…</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
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
                {ads.map(ad => (
                  <tr key={ad.id} className="border-t border-gray-200 dark:border-gray-600">
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{ad.advertisementItem}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{ad.advertisementPrice.toFixed(2)}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{new Date(ad.publicationDate).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-2">
                      <Link href={`/announcements/${ad.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        Voir plus
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>

        <button
          className="hidden md:block absolute top-5 right-5 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-900" />}
        </button>
      </div>
    </div>
  );
}

function NavItem({ title, link }: { title: string; link: string }) {
  return (
    <li className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md">
      <PlusCircle className="w-4 h-4" />
      <Link href={link}>
        <span>{title}</span>
      </Link>
    </li>
  )
}
