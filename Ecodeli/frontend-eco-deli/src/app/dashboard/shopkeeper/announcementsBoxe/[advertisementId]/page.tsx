"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"

interface Local {
  id: number
  city: string
  address: string
  capacity: number
  active: boolean
}

interface Box {
  id: number
  size: string
  status: string
  local: Local
}

interface Package {
  id: number
  packageName: string
}

interface Reservation {
  id: number
  startDate: string
  endDate: string
  box: Box
  package?: Package
}

export default function BoxesPage() {
  const [locals, setLocals] = useState<Local[]>([])
  const [boxesMap, setBoxesMap] = useState<Record<number, Box[]>>({})
  const [selectedLocalId, setSelectedLocalId] = useState<number | null>(null)
  const [selectedBox, setSelectedBox] = useState<Box | null>(null)
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const [reservationMessage, setReservationMessage] = useState("")

  const [clientId, setClientId] = useState<number | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [reservationHistory, setReservationHistory] = useState<Reservation[]>([])
  const params = useParams();
  const advertisementId = params.advertisementId ? Number(params.advertisementId) : null;
  const [packageToBoxMap, setPackageToBoxMap] = useState<Record<number, number | null>>({});
  const router = useRouter()
  const [showSuccessModal, setShowSuccessModal] = useState(false);



  useEffect(() => {
    const fetchPackagesForAd = async () => {
      if (!advertisementId) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${advertisementId}/packages`);
        const data = await res.json();
        console.log("📦 Colis reçus :", data);
        setPackages(data);
      } catch (err) {
        console.error("❌ Erreur récupération des colis :", err);
      }
    }

    fetchPackagesForAd();
  }, [advertisementId]);




  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")
      if (!token) return
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setClientId(data.userId)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const fetchLocalsAndBoxes = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locals`)
      const localsData: Local[] = await res.json()
      setLocals(localsData)
      setSelectedLocalId(localsData[0]?.id || null)

      const map: Record<number, Box[]> = {}
      for (const local of localsData) {
        const resBoxes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boxes/by-local/${local.id}`)
        const boxes = await resBoxes.json()
        map[local.id] = Array.isArray(boxes) ? boxes : []
      }
      setBoxesMap(map)
    }
    fetchLocalsAndBoxes()
  }, [])

  useEffect(() => {
    if (!clientId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/user/${clientId}`)
        const history = await res.json()
        if (Array.isArray(history)) {
          setReservationHistory(history)
        } else {
          console.error("Réponse invalide :", history)
          setReservationHistory([])
        }
      } catch (error) {
        console.error("Erreur de récupération d'historique :", error)
        setReservationHistory([])
      }
    }

    fetchHistory();
  }, [clientId])


  const handleReserve = async () => {
    if (!clientId || !startDate || !endDate || !selectedBox || !selectedPackageId) {
      setReservationMessage("❌ Veuillez remplir tous les champs");
      return;
    }

    const diff = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 10) {
      setReservationMessage("⛔ Durée max 10 jours");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boxId: selectedBox.id,
          userId: clientId,
          startDate,
          endDate,
          packageId: selectedPackageId,
        }),
      });

      if (res.ok) {
        setReservationMessage("✅ Réservation réussie !");
        setSelectedBox(null);
        setSelectedPackageId(null);
        setShowSuccessModal(true);
      } else {
        const error = await res.text();
        setReservationMessage("❌ Erreur : " + error);
      }
    } catch (err) {
      console.error("Erreur de réservation :", err);
      setReservationMessage("❌ Une erreur réseau est survenue.");
    }
  };




  const handleCancel = async (reservationId: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservationId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: clientId }),
    })
    if (res.ok) {
      setReservationHistory(prev => prev.filter(r => r.id !== reservationId))
    }
  }

  const formatDate = (date: string) => {
    try {
      return new Intl.DateTimeFormat("fr-FR").format(new Date(date))
    } catch {
      return date
    }
  }

  const boxList = boxesMap[selectedLocalId ?? -1]
  const isBoxListValid = Array.isArray(boxList)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Réserver une Box</h1>
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => router.push(`/dashboard/client/announcementPage/${advertisementId}`)}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Voir l'annonce associé
        </button>
        <button
          onClick={() => router.push(`/dashboard/client/announcements`)}
          className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Retour à mes annonces
        </button>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          {locals.map(local => (
            <div
              key={local.id}
              onClick={() => setSelectedLocalId(local.id)}
              className={`p-4 rounded border cursor-pointer mb-2 ${selectedLocalId === local.id ? 'border-green-500' : 'border-gray-300'}`}
            >
              <p className="font-semibold">{local.city}</p>
              <p className="text-sm text-gray-500">{local.address}</p>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isBoxListValid ? (
              boxList.map(box => (
                <div key={box.id} className="p-4 bg-white shadow rounded border">
                  <p className="font-semibold">Box #{box.id}</p>
                  <p className="text-sm text-gray-600">Taille : {box.size}</p>
                  <p className="text-sm text-gray-600">Status box : {box.status}</p>
                  <button
                    className={`mt-2 w-full py-1 rounded text-white ${box.status === "reserved" ? "bg-gray-400 cursor-not-allowed" : "bg-green-500"}`}
                    onClick={() => box.status !== "reserved" && setSelectedBox(box)}
                    disabled={box.status === "reserved"}
                  >
                    {box.status === "reserved" ? "Réservée" : "Réserver"}
                  </button>

                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Aucune box trouvée.</p>
            )}
          </div>
        </div>
      </div>



      {selectedBox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2" onClick={() => setSelectedBox(null)}>
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-2">Réserver Box #{selectedBox.id}</h2>
            <label>Début</label>
            <input
              type="date"
              min={today} // ✅ bloque les dates passées
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full mb-2 border rounded p-2"
            />
            <label>Fin</label>
            <input
              type="date"
              min={today} // ✅ bloque les dates passées
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full mb-2 border rounded p-2"
            />
            <label>Colis à associer</label>
            <select
              value={selectedPackageId ?? ''}
              onChange={(e) => setSelectedPackageId(Number(e.target.value))}
              className="w-full mb-4 border rounded p-2"
            >
              <option value="">-- Sélectionnez un colis --</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>{pkg.packageName || `Colis #${pkg.id}`}</option>
              ))}
            </select>
            
            <button
              onClick={handleReserve}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Confirmer
            </button>
            {reservationMessage && <p className="mt-2 text-sm text-center text-red-500">{reservationMessage}</p>}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-2">📜 Historique</h2>
        {Array.isArray(reservationHistory) && reservationHistory.length === 0 ? (
          <p>Aucune réservation</p>
        ) : Array.isArray(reservationHistory) ? (
          <ul className="space-y-3">
            {reservationHistory.map(r => (
              <li key={r.id} className="bg-white p-4 rounded shadow">
                <p><strong>Box #{r.box.id}</strong> ({r.box.size}) à {r.box.local.city}</p>
                <p>📦 Colis associé : {r.package?.packageName || "Aucun"}</p>
                <p>📅 {formatDate(r.startDate)} → {formatDate(r.endDate)}</p>
                {new Date(r.startDate) > new Date() && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    className="mt-2 px-3 py-1 text-sm bg-red-500 text-white rounded"
                  >
                    Annuler
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500">Erreur de chargement de l'historique</p>
        )}
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-green-600 mb-4">Réservation réussie</h2>
            <p>Votre box a bien été réservée.</p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push(`/dashboard/client/announcementPage/${advertisementId}`);
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Voir l'annonce
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
