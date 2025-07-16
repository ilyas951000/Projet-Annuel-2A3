'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);


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
  status?: 'disponible' | 'en attente' | 'réservé';
};





export default function DispoLivreurPage() {
  const { idPrestataire } = useParams();

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [message, setMessage] = useState('');

  const [clientId, setClientId] = useState<number | null>(null);


  
  const handleBooking = async (scheduleId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Token manquant");
        return;
    }

    try {
        await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/booking-prestataire`,
        {
            scheduleId: scheduleId,
            clientId: clientId,
            providerId: parseInt(idPrestataire as string, 10),
            role: 'prestataire',
            status: 'en attente',
        },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        alert("Réservation envoyée !");
        window.location.reload();
    } catch (error) {
        console.error("Erreur lors de la réservation :", error);
        alert("Échec de la réservation.");
    }
};


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
          `${process.env.NEXT_PUBLIC_API_URL}/courier/${idPrestataire }/schedule`,
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
            status: s.scheduleStatus,
            }));

        setEvents(data);
      } catch (error) {
        console.error(error);
        setMessage('Erreur lors de la récupération des disponibilités.');
      }
    };

    if (idPrestataire ) fetchDispos();
  }, [idPrestataire ]);

  useEffect(() => {
    const fetchDispos = async () => {
        try {
        const token = localStorage.getItem('token');

        const [resSchedules, resBusy] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/courier/${idPrestataire}/schedule`, {
            headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/booking-prestataire/schedules/status`, {
            headers: { Authorization: `Bearer ${token}` },
            }),
        ]);

        const busyMap = new Map<number, string>();
        resBusy.data.forEach((b: { scheduleId: number; status: string }) => {
            busyMap.set(b.scheduleId, b.status);
        });

        const data = resSchedules.data.map((s: Schedule) => ({
            id: s.id,
            title: s.scheduleDescription,
            start: new Date(s.scheduleStart),
            end: new Date(s.scheduleEnd),
            isBooked: busyMap.has(s.id),
            status: busyMap.get(s.id) || 'disponible',
        }));

        setEvents(data);
        } catch (error) {
        console.error(error);
        setMessage('Erreur lors de la récupération des disponibilités.');
        }
    };

    if (idPrestataire) fetchDispos();
    }, [idPrestataire]);




  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Disponibilités du prestataire #{idPrestataire }</h2>

      {message && <p className="text-red-600">{message}</p>}

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
                let color = '#ccc';
                if (event.status === 'réservé') color = '#999';
                if (event.status === 'en attente') color = '#ddd';

                return {
                style: {
                    backgroundColor: color,
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
