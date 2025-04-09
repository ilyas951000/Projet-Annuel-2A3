import type { NextPage } from 'next';
import Link from 'next/link';
import "tailwindcss";

const AdminConnexion: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-3xl font-bold">Voici la connexion livreur</h1>

      <Link href="/dashboard/livreur/documents">
        <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
          Accéder aux justificatifs
        </button>
      </Link>
    </div>
  );
};

export default AdminConnexion;
