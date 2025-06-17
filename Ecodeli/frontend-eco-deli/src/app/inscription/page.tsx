'use client';

import { useRouter } from 'next/navigation';

export default function SelectRolePage() {
  const router = useRouter();

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const role = event.target.value;
    if (role) {
      router.push(`/inscription/role/${role}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md text-center">
        <h1 className="text-xl font-semibold mb-4">Choisissez votre type de compte</h1>
        <select
          className="px-4 py-2 border rounded-lg"
          onChange={handleSelect}
          defaultValue=""
        >
          <option value="" disabled>Sélectionner un rôle</option>
          <option value="Client">Client</option>
          <option value="Prestataire">Prestataire</option>
          <option value="Commercant">Commerçant</option>
          <option value="Livreur">Livreur</option>
        </select>
      </div>
    </div>
  );
}
