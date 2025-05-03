"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";
import { Moon, Sun, Settings, PlusCircle, User, Menu, X } from "lucide-react";

type UserData = {
  userId: number;
  userStatus: string;
  valid: boolean;
};

const AdminConnexion: NextPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token récupéré:", token);

    const fetchUserData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://51.15.231.248:3001/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Données utilisateur:", res.data);

        const data = res.data;
        const formattedData: UserData = {
          ...data,
          valid: Boolean(data.valid),
        };

        setUserData(formattedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des infos utilisateur", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Chargement...</p>;
  }

  if (!userData) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-600">Utilisateur non connecté ou token invalide.</p>
      </div>
    );
  }

  if (!userData.valid) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6">
        <h1 className="text-3xl font-bold">Bienvenue sur votre espace livreur</h1>
        <Link href="/dashboard/livreur/documents">
          <button className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition">
            Envoyer mes justificatifs
          </button>
        </Link>
      </div>
    );
  }

  // Si l'utilisateur est validé, on affiche le dashboard complet
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
                <NavItem title="Accueil" link="./dashboard/prestataire" />
                <NavItem title="Mes Avis" link="./prestataire/avis" />
                <NavItem title="Les Interventions disponibles" link="/dashboard/prestataire/prestations" />
                <NavItem title="Mes Prestations" link="/dashboard/prestataire/interventions" />
                <NavItem title="Mes disponibilités" link="/dashboard/prestataire/planning" />
                <NavItem title="Mes Factures" link="/services" />
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

          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Bienvenue Chez <span className="text-black">Eco</span>
            <span className="text-green-500">Deli</span> - partie Client
          </h2>
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
};

export default AdminConnexion;

function NavItem({ title, link }: { title: string; link: string }) {
  return (
    <li className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md">
      <PlusCircle className="w-4 h-4" />
      <Link href={link}>
        <span>{title}</span>
      </Link>
    </li>
  );
}
