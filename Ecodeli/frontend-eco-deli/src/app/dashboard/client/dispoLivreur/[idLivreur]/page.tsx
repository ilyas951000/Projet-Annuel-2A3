'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

type Advertisement = {
  id: number;
  advertisementTitle: string;
};

type Package = {
  id: number;
};

type Schedule = {
  id: number;
  scheduleStart: string;
  scheduleEnd: string;
  scheduleDescription: string;
  scheduleStatus: 'disponible' | 'en attente' | 'réservé';
};

type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  isBooked?: boolean;
};

export default function DispoLivreurPage() {
  const { idLivreur } = useParams();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [message, setMessage] = useState('');
  const [annonces, setAnnonces] = useState<Advertisement[]>([]);
  const [selectedAnnonceId, setSelectedAnnonceId] = useState<number | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);

  const [clientId, setClientId] = useState<number | null>(null);


  useEffect(() => {
    const fetchClient = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Token manquant");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.userId) {
          setClientId(data.userId); // ✅ le champ correct est userId
        } else {
          throw new Error("Utilisateur non valide.");
        }
      } catch (err: any) {
        setMessage(err.message);
      }
    };

    fetchClient();
  }, []);


  useEffect(() => {
    const fetchDispos = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/courier/${idLivreur}/schedule`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = res.data.map((s: Schedule) => ({
          id: s.id,
          title: s.scheduleDescription,
          start: new Date(s.scheduleStart),
          end: new Date(s.scheduleEnd),
          isBooked: s.scheduleStatus !== 'disponible',
        }));
        setEvents(data);
      } catch (error) {
        console.error(error);
        setMessage('Erreur lors de la récupération des disponibilités.');
      }
    };

    if (idLivreur) fetchDispos();
  }, [idLivreur]);

  // Récupère les annonces du client
  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnnonces(res.data);
      } catch (error) {
        console.error(error);
        setMessage('Erreur lors de la récupération de vos annonces.');
      }
    };

    fetchAnnonces();
  }, []);

  // Récupère les colis de l’annonce sélectionnée
  useEffect(() => {
    const fetchPackages = async () => {
      if (!selectedAnnonceId) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/advertisements/${selectedAnnonceId}/packages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPackages(res.data);
      } catch (error) {
        console.error(error);
        setMessage("Erreur lors du chargement des colis.");
      }
    };

    fetchPackages();
  }, [selectedAnnonceId]);

  // Réservation pour tous les colis de l’annonce sélectionnée
  const handleBooking = async (scheduleId: number) => {
  if (!selectedAnnonceId || packages.length === 0) {
    alert("Veuillez sélectionner une annonce contenant des colis.");
    return;
  }

  if (!clientId) {
    alert("Client non identifié");
    return;
  }

  const courierId = parseInt(idLivreur as string, 10);
  if (isNaN(courierId)) {
    alert("ID livreur invalide");
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Token manquant");
      return;
    }

    await Promise.all(
      packages.map((pkg) =>
        axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/booking`,
          {
            scheduleId,
            clientId,
            packageId: pkg.id,
            courierId,
            role: 'livreur',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      )
    );

    alert("Réservation envoyée pour tous les colis !");
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la réservation. Voir la console pour plus de détails.");
  }
};



  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Disponibilités du livreur #{idLivreur}</h2>

      {message && <p className="text-red-600">{message}</p>}

      {/* Sélection de l’annonce */}
      <div className="mb-6">
        <label className="block font-medium mb-1">Choisir une annonce :</label>
        <select
          className="border rounded px-3 py-2 w-full"
          onChange={(e) => setSelectedAnnonceId(Number(e.target.value))}
          value={selectedAnnonceId ?? ''}
        >
          <option value="">-- Sélectionner --</option>
          {annonces.map((ad) => (
            <option key={ad.id} value={ad.id}>
              {ad.advertisementTitle || `Annonce #${ad.id}`}
            </option>
          ))}
        </select>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={['month', 'week', 'day', 'agenda']}
        style={{ height: 600 }}
        selectable
        onSelectEvent={(event: CalendarEvent) => {
          if (event.isBooked) {
            alert("Ce créneau est déjà réservé ou en attente.");
            return;
          }
          handleBooking(event.id);
        }}
        eventPropGetter={(event: CalendarEvent) => {
          if (event.isBooked) {
            return {
              style: {
                backgroundColor: '#ccc',
                cursor: 'not-allowed',
                opacity: 0.6,
              },
            };
          }
          return {};
        }}
      />

    </div>
  );
}
