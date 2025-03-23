"use client";
import { useState } from "react";
import { Moon, Sun, Settings, PlusCircle, User, ChevronDown, ChevronUp, FileText } from "lucide-react";
import Link from 'next/link';
import Image from "next/image";

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white dark:bg-gray-800 p-5 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              <Link href="/connexion" className="bg-green-600 px-4 py-2 rounded-lg text-black font-semibold mr-2">
                <Image src="/logo1.png" alt="EcoDeli Logo" width={120} height={20} className="h-10 w-auto" />
              </Link>
            </h1>

            {/* Navigation Links */}
            <nav className="mt-5">
              <ul className="space-y-3">
                <DropdownMenu 
                  title="Gestion utilisateur" 
                  menuKey="gestionUtilisateur" 
                  isOpen={openMenus["gestionUtilisateur"]} 
                  toggleMenu={toggleMenu} 
                  subItems={[
                    { title: "Création et inscription", link: "/dashboard/admin/creation-inscription" },
                    { title: "Modification et mise à jour du profil", link: "/dashboard/admin/modification-profil" },
                    { title: "Gestion des rôles et permissions", link: "/dashboard/admin/roles-permissions" },
                    { title: "Bannissement et suspension", link: "/dashboard/admin/bannissement" },
                    { title: "Historique et logs", link: "/dashboard/admin/historique-logs" }
                  ]} 
                />

                <DropdownMenu 
                  title="Gestion commerçant" 
                  menuKey="gestionCommercant" 
                  isOpen={openMenus["gestionCommercant"]} 
                  toggleMenu={toggleMenu} 
                  subItems={[
                    { title: "Gestion du contrat", link: "/dashboard/admin/gestion-contrat" },
                    { title: "Gestion des annonces", link: "/dashboard/admin/gestion-annonces" },
                    { title: "Facturation et paiements", link: "/dashboard/admin/facturation-paiements" },
                    { title: "Tableau de bord", link: "/dashboard/admin/tableau-de-bord" },
                    { title: "Support et communication", link: "/dashboard/admin/support" }
                  ]} 
                />

                <DropdownMenu 
                  title="Gestion prestataire" 
                  menuKey="gestionPrestataire" 
                  isOpen={openMenus["gestionPrestataire"]} 
                  toggleMenu={toggleMenu} 
                  subItems={[
                    { title: "Validation et vérification", link: "/dashboard/admin/validation" },
                    { title: "Calendrier et disponibilités", link: "/dashboard/admin/calendrier" },
                    { title: "Suivi des interventions", link: "/dashboard/admin/suivi-interventions" },
                    { title: "Facturation automatique", link: "/dashboard/admin/facturation-automatique" },
                    { title: "Gestion tarifaire", link: "/dashboard/admin/gestion-tarifaire" }
                  ]} 
                />

                <DropdownMenu 
                  title="Gestion livreur" 
                  menuKey="gestionLivreur" 
                  isOpen={openMenus["gestionLivreur"]} 
                  toggleMenu={toggleMenu} 
                  subItems={[
                    { title: "Inscription et vérification", link: "/dashboard/admin/inscription-livreur" },
                    { title: "Gestion des annonces", link: "/dashboard/admin/gestion-annonces-livreur" },
                    { title: "Suivi des livraisons", link: "/dashboard/admin/suivi-livraisons" },
                    { title: "Planning et gestion des trajets", link: "/dashboard/admin/planning-trajets" },
                    { title: "Gestion des paiements", link: "/dashboard/admin/gestion-paiements" },
                    { title: "Support et assistance", link: "/dashboard/admin/support-livreur" }
                  ]} 
                />

                <DropdownMenu 
                  title="Gestion Client" 
                  menuKey="gestionClient" 
                  isOpen={openMenus["gestionClient"]} 
                  toggleMenu={toggleMenu} 
                  subItems={[
                    { title: "Dépôt et gestion des annonces de transport", link: "/dashboard/admin/depot-annonces" },
                    { title: "Suivi des livraisons en cours", link: "/dashboard/admin/suivi-livraisons-client" },
                    { title: "Paiements et facturation", link: "/dashboard/admin/paiements-facturation" },
                    { title: "Gestion des box de stockage temporaire", link: "/dashboard/admin/gestion-box" },
                    { title: "Service client et litiges", link: "/dashboard/admin/service-client" }
                  ]} 
                />

                {/* NOUVEAU - Gestion des annonces */}
                <DropdownMenu 
                  title="Gestion des annonces" 
                  menuKey="gestionAnnonces" 
                  isOpen={openMenus["gestionAnnonces"]} 
                  toggleMenu={toggleMenu} 
                  subItems={[
                    { title: "📋 Annonces en attente", link: "/dashboard/admin/advertisementManagement/annonces" },
                    { title: "➕ Ajouter une annonce", link: "/dashboard/admin/advertisementManagement/ajouter-annonce" }
                  ]} 
                />
              </ul>
            </nav>

            {/* Autres liens */}
            <div className="mt-10 space-y-3">
              <NavItem title="À propos" link="/a-propos" />
              <NavItem title="Nous contacter" link="/contact" />
            </div>
          </div>

          {/* Section Compte */}
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-300">Mon compte</span>
            <Settings className="w-5 h-5 text-gray-500 dark:text-gray-300 cursor-pointer" />
          </div>
        </aside>

        {/* Contenu Principal */}
        <main className="flex-1 p-10">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Bienvenue Chez <span className="text-black">Eco</span>
            <span className="text-green-500">Deli</span> - partie admin
          </h2>
          {/* Ici tu pourras ajouter le contenu spécifique de chaque page */}
        </main>

        {/* Toggle Dark Mode */}
        <button
          className="absolute top-5 right-5 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-900" />}
        </button>
      </div>
    </div>
  );
}

/* Composant pour un menu déroulant */
function DropdownMenu({ title, menuKey, isOpen, toggleMenu, subItems }: { 
  title: string; 
  menuKey: string; 
  isOpen: boolean; 
  toggleMenu: (menu: string) => void; 
  subItems: { title: string; link: string }[]; 
}) {
  return (
    <li>
      <button 
        className="flex items-center justify-between w-full text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md"
        onClick={() => toggleMenu(menuKey)}
      >
        <span className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>{title}</span>
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <ul className="ml-6 mt-2 space-y-2">
          {subItems.map((item, index) => (
            <li key={index} className="text-gray-600 dark:text-gray-400 hover:text-green-500 cursor-pointer p-2">
              <Link href={item.link}>
                <span>• {item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/* Composant pour un élément de navigation classique */
function NavItem({ title, link }: { title: string; link: string; }) {
  return (
    <li className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md">
      <PlusCircle className="w-4 h-4" />
      <Link href={link}>
        <span>{title}</span>
      </Link>
    </li>
  );
}
