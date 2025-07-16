'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';

import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

export default function PlanningPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [courierId, setCourierId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const localizer = momentLocalizer(moment);

  // Récupérer le token depuis le localStorage
  const getToken = () => localStorage.getItem('token');

  // Récupération de l'utilisateur connecté
  useEffect(() => {
    const token = getToken();
    console.log('Token récupéré depuis localStorage:', token);
    if (!token) {
      setMessage('Utilisateur non connecté. Token manquant.');
      return;
    }
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Réponse de auth/me:', res.data);
        if (res.data && res.data.userId) {
          setCourierId(res.data.userId);
        } else {
          setMessage('Utilisateur non valide ou ID manquant dans la réponse.');
        }
      } catch (err: any) {
        console.error('Erreur lors de fetchCurrentUser:', 
          err.response ? JSON.stringify(err.response.data) : err.message
        );
        setMessage(
          'Erreur lors de la récupération de l’utilisateur : ' +
          (err.response?.data?.message || err.message)
        );
      }
    };
    fetchCurrentUser();
  }, []);

  // Récupère les créneaux depuis le backend
  const fetchSchedules = async (courierId: number) => {
  const token = getToken();
  try {
    // ✅ Appels à la fois aux schedules et aux bookings prestataire
    const [schedulesRes, bookingsRes] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/courier/${courierId}/schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/booking-prestataire/schedules/status`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    // ✅ Création d’une map pour associer chaque schedule à son status
    const statusMap = new Map<number, string>();
    bookingsRes.data.forEach((b: { scheduleId: number; status: string }) => {
      statusMap.set(b.scheduleId, b.status);
    });

    // ✅ Ajout des informations de status à chaque event
    const formatted = schedulesRes.data.map((s: any) => ({
      id: s.id,
      title: s.scheduleDescription,
      start: new Date(s.scheduleStart),
      end: new Date(s.scheduleEnd),
      status: statusMap.get(s.id) || 'disponible',
      isBooked: statusMap.has(s.id),
    }));

    setEvents(formatted);
  } catch (error: any) {
    console.error('Erreur lors de la récupération du planning:', 
      error.response ? JSON.stringify(error.response.data) : error.message
    );
    setMessage('Erreur lors de la récupération du planning.');
  }
};


  // Ajout d'un créneau
  const handleSelectSlot = async ({ start, end }: { start: Date; end: Date }) => {
    const description = prompt('Description du créneau :');
    if (!description || courierId === null) return;

    const token = getToken();
    const payload = {
      scheduleStart: start.toISOString(),
      scheduleEnd: end.toISOString(),
      scheduleStatus: 'disponible',
      scheduleDescription: description,
    };
    console.log('Envoi du payload pour créer un créneau:', payload);
    
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/courier/${courierId}/schedule`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Réponse POST ajout créneau:', res.data);
      setMessage('Créneau ajouté avec succès.');
      fetchSchedules(courierId);
    } catch (error: any) {
      console.error('Erreur lors de la création du créneau:', 
        error.response ? JSON.stringify(error.response.data) : error.message
      );
      setMessage('Erreur lors de l’ajout du créneau.');
    }
  };

  // Suppression d'un créneau
  const handleSelectEvent = async (event: any) => {
    if (confirm('Supprimer ce créneau ?') && courierId !== null) {
      const token = getToken();
      try {
        console.log(`Suppression du créneau avec id ${event.id}`);
        const res = await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/courier/${courierId}/schedule/${event.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Réponse DELETE créneau:', res.data);
        setMessage('Créneau supprimé avec succès.');
        fetchSchedules(courierId);
      } catch (error: any) {
        console.error('Erreur lors de la suppression du créneau:', 
          error.response ? JSON.stringify(error.response.data) : error.message
        );
        setMessage('Erreur lors de la suppression du créneau.');
      }
    }
  };

  // Charger les schedules dès que le courierId est disponible
  useEffect(() => {
    if (courierId !== null) {
      fetchSchedules(courierId);
    }
  }, [courierId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Gestion du planning</h2>
      {message && <p className="mb-4 text-sm text-red-600">{message}</p>}
      <Calendar
        selectable
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={['month', 'week', 'day', 'agenda']} // 👈 à ajouter
        defaultView="month"                        // 👈 à ajouter
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        toolbar={true}
        eventPropGetter={(event: any): React.HTMLAttributes<HTMLElement> => {
    if (event.status === 'réservé') {
      return {
        style: {
          backgroundColor: '#999',
          opacity: 0.6,
          cursor: 'not-allowed',
        },
      };
    }
    if (event.status === 'en attente') {
      return {
        style: {
          backgroundColor: '#ddd',
          opacity: 0.6,
          cursor: 'not-allowed',
        },
      };
    }
    return {};
  }}
      />

      <p className="mt-4 text-sm">
        Pour ajouter un créneau, sélectionnez une plage horaire dans le calendrier et saisissez une description.
        Pour supprimer, cliquez sur l’événement.
      </p>
    </div>
  );
}
