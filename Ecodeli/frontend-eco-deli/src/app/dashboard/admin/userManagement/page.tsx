"use client";
import { useEffect, useState, ChangeEvent } from 'react';

interface User {
  id: number;
  userFirstName: string;
  userLastName: string;
  email: string;
  userRole: string;
  userStatus: string;
  userAddress: string;
  hasAccount: boolean;
  userInsurance: boolean;
  occasionalCourier: boolean;
  valid: boolean;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    userFirstName: '',
    userLastName: '',
    email: '',
    userRole: '',
    userStatus: '',
    userAddress: '',
    hasAccount: false,
    userInsurance: false,
    occasionalCourier: false,
    valid: false,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('http://51.15.231.248:3001/users');
      const data = await res.json();
      setUsers(data);
    };

    fetchUsers();
  }, []);

  // Récupère l'utilisateur complet via findOne et pré-remplit le formulaire
  const openModal = async (user: User) => {
    const res = await fetch(`http://51.15.231.248:3001/users/${user.id}`);
    const fullUser: User = await res.json();
    setSelectedUser(fullUser);
    setFormData({
      userFirstName: fullUser.userFirstName,
      userLastName: fullUser.userLastName,
      email: fullUser.email,
      userRole: fullUser.userRole,
      userStatus: fullUser.userStatus,
      userAddress: fullUser.userAddress,
      hasAccount: fullUser.hasAccount,
      userInsurance: fullUser.userInsurance,
      occasionalCourier: fullUser.occasionalCourier,
      valid: fullUser.valid,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  // Gestion des changements dans le formulaire
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Envoi des modifications vers le backend
  const handleUpdate = async () => {
    if (selectedUser) {
      const res = await fetch(`http://51.15.231.248:3001/users/${selectedUser.id}`, {
        method: 'PUT', // ou 'PATCH' en fonction de votre implémentation
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        console.log('Utilisateur mis à jour avec succès');
        // Optionnel : mettre à jour la liste des utilisateurs
        const updatedUser = await res.json();
        setUsers((prev) =>
          prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        );
      } else {
        console.error('Erreur lors de la mise à jour');
      }
    }
    closeModal();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Liste des Utilisateurs</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Prénom</th>
            <th className="border px-4 py-2">Nom</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">{user.userFirstName}</td>
              <td className="border px-4 py-2">{user.userLastName}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => openModal(user)}
                  className="bg-blue-500 text-white py-1 px-3 rounded mr-2"
                >
                  Modifier
                </button>
                <button
                  onClick={() => openModal(user)}
                  className="bg-red-500 text-white py-1 px-3 rounded"
                >
                  Bannir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              Modifier l'utilisateur: {selectedUser.userFirstName} {selectedUser.userLastName}
            </h2>
            <form>
              <div className="mb-2">
                <label className="block font-bold">Prénom:</label>
                <input
                  type="text"
                  name="userFirstName"
                  value={formData.userFirstName}
                  onChange={handleInputChange}
                  className="border px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block font-bold">Nom:</label>
                <input
                  type="text"
                  name="userLastName"
                  value={formData.userLastName}
                  onChange={handleInputChange}
                  className="border px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block font-bold">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block font-bold">Rôle:</label>
                <select
                  name="userRole"
                  value={formData.userRole}
                  onChange={handleInputChange}
                  className="border px-2 py-1 w-full"
                >
                  <option value="">Sélectionnez un rôle</option>
                  <option value="prestataire">Prestataire</option>
                  <option value="client">Client</option>
                  <option value="livreur">Livreur</option>
                  <option value="commercant">Commercant</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="block font-bold">Statut:</label>
                <input
                  type="text"
                  name="userStatus"
                  value={formData.userStatus}
                  onChange={handleInputChange}
                  className="border px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block font-bold">Adresse:</label>
                <input
                  type="text"
                  name="userAddress"
                  value={formData.userAddress}
                  onChange={handleInputChange}
                  className="border px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2 flex items-center">
                <label className="block font-bold mr-2">Has Account:</label>
                <input
                  type="checkbox"
                  name="hasAccount"
                  checked={formData.hasAccount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-2 flex items-center">
                <label className="block font-bold mr-2">Insurance:</label>
                <input
                  type="checkbox"
                  name="userInsurance"
                  checked={formData.userInsurance}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-2 flex items-center">
                <label className="block font-bold mr-2">Occasional Courier:</label>
                <input
                  type="checkbox"
                  name="occasionalCourier"
                  checked={formData.occasionalCourier}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-2 flex items-center">
                <label className="block font-bold mr-2">Valid:</label>
                <input
                  type="checkbox"
                  name="valid"
                  checked={formData.valid}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="bg-green-500 text-white py-2 px-4 rounded mr-2"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 text-black py-2 px-4 rounded"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
