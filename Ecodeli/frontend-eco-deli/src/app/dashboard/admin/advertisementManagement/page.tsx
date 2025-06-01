"use client";

import { useEffect, useState } from 'react';

export default function AdvertisementManagement() {
  const [advertisements, setAdvertisements] = useState([]);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    advertisementItem: '',
    advertisementPrice: 0,
    advertisementQuantity: 0,
    advertisementWeight: 0,
    additionalInformation: '',
  });

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const token = localStorage.getItem('token'); // Assure-toi que le JWT est bien stocké
        const res = await fetch('http://localhost:3001/advertisements/admin', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setAdvertisements(data);
        } else {
          console.error("Format inattendu :", data);
          setAdvertisements([]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des annonces :", error);
      }
    };

    fetchAds();
  }, []);

  const validateAd = async (id) => {
    await fetch(`http://localhost:3001/advertisements/${id}/validate`, {
      method: 'PATCH',
    });
    setAdvertisements(prev =>
      prev.map(ad => (ad.id === id ? { ...ad, isValidated: true } : ad))
    );
  };

  const deleteAd = async (id) => {
    await fetch(`http://localhost:3001/advertisements/${id}`, {
      method: 'DELETE',
    });
    setAdvertisements(prev => prev.filter(ad => ad.id !== id));
  };

  const startEditing = (ad) => {
    setEditingAd(ad);
    setFormData({
      advertisementItem: ad.advertisementItem,
      advertisementPrice: ad.advertisementPrice,
      advertisementQuantity: ad.advertisementQuantity,
      advertisementWeight: ad.advertisementWeight,
      additionalInformation: ad.additionalInformation,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedAd = { ...formData };

    const response = await fetch(`http://localhost:3001/advertisements/${editingAd.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedAd),
    });

    if (response.ok) {
      setAdvertisements((prev) =>
        prev.map((ad) =>
          ad.id === editingAd.id ? { ...ad, ...formData } : ad
        )
      );
      setEditingAd(null);
    } else {
      console.error("Erreur lors de la modification de l'annonce");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestion des annonces</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {advertisements.map(ad => (
          <li key={ad.id} style={{ marginBottom: '10px', border: '1px solid #ddd', padding: '10px' }}>
            <div>
              <strong>{ad.advertisementItem}</strong> - {ad.isValidated ? "✅ Validé" : "❌ En attente"}
            </div>

            <div>
              <strong>Utilisateur :</strong>{' '}
              {ad.users?.userFirstName ?? 'Inconnu'} {ad.users?.userLastName ?? ''}
            </div>

            {ad.advertisementPhoto && (
              <div>
                <img
                  src={`http://localhost:3001/uploads/${ad.advertisementPhoto}`}
                  alt={ad.advertisementItem}
                  style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px' }}
                />
              </div>
            )}

            <div><strong>Prix :</strong> {ad.advertisementPrice} €</div>
            <div><strong>Quantité :</strong> {ad.advertisementQuantity}</div>
            <div><strong>Poids :</strong> {ad.advertisementWeight} kg</div>
            <div><strong>Informations supplémentaires :</strong> {ad.additionalInformation}</div>

            <div style={{ marginTop: '5px' }}>
              {!ad.isValidated && (
                <button
                  onClick={() => validateAd(ad.id)}
                  style={{ marginRight: '10px', background: 'green', color: 'white', padding: '5px' }}
                >
                  Valider
                </button>
              )}
              <button
                onClick={() => deleteAd(ad.id)}
                style={{ background: 'red', color: 'white', padding: '5px' }}
              >
                Supprimer
              </button>
              <button
                onClick={() => startEditing(ad)}
                style={{ marginLeft: '10px', background: 'blue', color: 'white', padding: '5px' }}
              >
                Modifier
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editingAd && (
        <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px' }}>
          <h2>Modifier l'annonce</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Nom de l'annonce :</label>
              <input
                type="text"
                name="advertisementItem"
                value={formData.advertisementItem}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Prix :</label>
              <input
                type="number"
                name="advertisementPrice"
                value={formData.advertisementPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Quantité :</label>
              <input
                type="number"
                name="advertisementQuantity"
                value={formData.advertisementQuantity}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Poids :</label>
              <input
                type="number"
                name="advertisementWeight"
                value={formData.advertisementWeight}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Informations supplémentaires :</label>
              <textarea
                name="additionalInformation"
                value={formData.additionalInformation}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <button type="submit" style={{ marginTop: '10px', background: 'orange', color: 'white', padding: '5px' }}>
                Sauvegarder les modifications
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
