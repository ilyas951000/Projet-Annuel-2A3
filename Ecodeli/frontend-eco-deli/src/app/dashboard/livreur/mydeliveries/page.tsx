"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"


interface IPackage {
  id: number
  packageName: string
  packageWeight: number
  packageDimension: string
  deliveryStatus: string
  packageDescription?: string
  senderAddress?: string
  recipientAddress?: string
  packageRequirements?: string
  isPaid?: boolean
  advertisementId?: number
}

interface IUser {
  id: number
  userLastName: string
  userFirstName: string
  email: string
  userStatus: string
}

interface ITransferInfo {
  address: string
  city: string
  postalCode: string
  livreur1Progress: number
  livreur2Progress: number
  fromCourierId: number
  toCourierId: number
  isConfirmed: boolean
}

const STATUS_OPTIONS = ["pris en charge", "en transit", "livré", "transféré"]

export default function TransferAndDeliveryPage() {
  const [packages, setPackages] = useState<IPackage[]>([])
  const [livreurId, setLivreurId] = useState<number | null>(null)
  const [codes, setCodes] = useState<{ [key: number]: string }>({})
  const [statusSelections, setStatusSelections] = useState<{ [key: number]: string }>({})
  const [transferSelections, setTransferSelections] = useState<{ [key: number]: number }>({})
  

  const [transferAddresses, setTransferAddresses] = useState<{
    [key: number]: { address: string; postalCode: string; city: string }
  }>({})
  const [transferCodes, setTransferCodes] = useState<{ [key: number]: string }>({})
  const [transferInfos, setTransferInfos] = useState<{ [key: number]: ITransferInfo }>({})
  const [livreurs, setLivreurs] = useState<IUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientIds, setClientIds] = useState<{ [key: number]: number | null }>({})
  const router = useRouter()


  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    if (!token) {
      setError("Utilisateur non connecté. Token manquant.")
      setLoading(false)
      return
    }

    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.data?.userId) {
          setLivreurId(res.data.userId)
        } else {
          setError("Utilisateur non valide ou ID manquant dans la réponse.")
        }
      } catch (err: any) {
        setError("Erreur utilisateur : " + (err.response?.data?.message || err.message))
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  useEffect(() => {
    const fetchLivreurs = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users`)
        setLivreurs(res.data.filter((u: IUser) => u.userStatus === "livreur"))
      } catch (err) {
        console.error("Erreur chargement livreurs :", err)
      }
    }
    fetchLivreurs()
  }, [])

  useEffect(() => {
    if (livreurId !== null) {
      fetchDeliveries()
      fetchPendingTransfers()
    }
  }, [livreurId])

  const fetchTransferInfo = async (packageId: number) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transfer-history/progress/${packageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTransferInfos((prev) => ({ ...prev, [packageId]: res.data }))
    } catch (err) {
      console.warn(`Pas d'info de transfert pour le colis ${packageId}`)
    }
  }

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/packages/mydeliveries`, {
        params: { userId: livreurId },
        headers: { Authorization: `Bearer ${token}` },
      })
      const inProgress = res.data.filter((p: IPackage) => p.deliveryStatus === "en cours")
      setPackages((prev) => {
        const combined = [...prev, ...inProgress];
        const unique = new Map<number, IPackage>();
        combined.forEach((pkg) => unique.set(pkg.id, pkg));
        return Array.from(unique.values());
      });


      const initStatuses: { [key: number]: string } = {}
      inProgress.forEach((pkg: IPackage) => {
        initStatuses[pkg.id] = pkg.deliveryStatus
      })
      setStatusSelections(initStatuses)
    } catch {
      setError("Erreur chargement des livraisons.")
    }
  }

  const fetchPendingTransfers = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/packages/pending-transfers`, {
        params: { userId: livreurId },
        headers: { Authorization: `Bearer ${token}` },
      })
      setPackages((prev) => [...prev, ...res.data])
      res.data.forEach((pkg: IPackage) => fetchTransferInfo(pkg.id))
    } catch {
      setError("Erreur chargement des colis à valider.")
    }
  }

  const handleConfirmTransfer = async (packageId: number) => {
    const code = codes[packageId]
    if (!code) return alert("Veuillez entrer le code de transfert.")

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}/confirm-transfer`,
        { toCourierId: livreurId, code },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      alert("Colis validé !")
      fetchDeliveries()
    } catch (err: any) {
      alert("Erreur : " + (err.response?.data?.message || err.message))
    }
  }
  

  const handleStatusUpdate = async (packageId: number) => {
    const newStatus = statusSelections[packageId]
    const transferData = transferAddresses[packageId] || {}
    const toCourierId = transferSelections[packageId]

    if (newStatus === "transféré") {
      if (!toCourierId || !transferData.address || !transferData.postalCode || !transferData.city) {
        return alert("Champs manquants pour transfert.")
      }

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}/transfer`,
          {
            fromCourierId: livreurId,
            toCourierId,
            address: transferData.address,
            postalCode: transferData.postalCode,
            city: transferData.city,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        setTransferCodes({ ...transferCodes, [packageId]: res.data.transferCode })
        alert("Colis transféré !")
      } catch (err: any) {
        alert("Erreur transfert : " + (err.response?.data?.message || err.message))
      }
    } else {
      try {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}/status`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        alert("Statut mis à jour")
      } catch (err: any) {
        alert("Erreur statut : " + (err.response?.data?.message || err.message))
      }
    }
  }
  const handleConfirmDelivery = async (packageId: number) => {
    const code = codes[packageId];
    if (!code?.trim()) {
      alert("Veuillez entrer un code.");
      return;
    }

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}/deliver`,
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Colis livré avec succès.");
      fetchDeliveries();
    } catch (err: any) {
      alert("Erreur de livraison : " + (err.response?.data?.message || err.message));
    }
  };


  const getClientIdFromAdvertisement = async (advertisementId: number): Promise<number | null> => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${advertisementId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.data?.usersId || null
    } catch (err) {
      console.error("Erreur récupération client depuis annonce :", err)
      return null
    }
  }
  const renderPackage = (pkg: IPackage) => (
    <>
      <h2 className="text-lg font-semibold mb-2">{pkg.packageName}</h2>
      <p><strong>Poids :</strong> {pkg.packageWeight} kg</p>
      <p><strong>Dimension :</strong> {pkg.packageDimension}</p>
      <p><strong>Statut :</strong> {pkg.deliveryStatus}</p>

      {transferInfos[pkg.id] && (
        <div className="bg-gray-100 border rounded p-2 my-2">
          <p><strong>Adresse :</strong> {transferInfos[pkg.id].address}</p>
          <p><strong>Ville :</strong> {transferInfos[pkg.id].city}</p>
          <p><strong>Code postal :</strong> {transferInfos[pkg.id].postalCode}</p>
          <p className="text-sm text-blue-600 font-semibold mt-2">
            {Number(livreurId) === Number(transferInfos[pkg.id].fromCourierId)
              ? `🧭 Vous avez réalisé ${transferInfos[pkg.id].livreur1Progress}% du trajet du colis.`
              : Number(livreurId) === Number(transferInfos[pkg.id].toCourierId)
                ? `📍 Il reste ${transferInfos[pkg.id].livreur2Progress}% du trajet jusqu'à destination.`
                : `Progression non applicable à ce livreur.`}
          </p>
        </div>
      )}

      {transferInfos[pkg.id]?.toCourierId === livreurId &&
        !transferInfos[pkg.id]?.isConfirmed && (
          <>
            <input
              type="text"
              placeholder="Code de transfert"
              className="border p-1 mt-2 w-full"
              value={codes[pkg.id] || ""}
              onChange={(e) => setCodes({ ...codes, [pkg.id]: e.target.value })}
            />
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => handleConfirmTransfer(pkg.id)}
            >
              Valider ce colis
            </button>
          </>
        )}

      <select
        value={statusSelections[pkg.id] || pkg.deliveryStatus}
        onChange={(e) => setStatusSelections({ ...statusSelections, [pkg.id]: e.target.value })}
        className="border p-1 rounded mt-2"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {statusSelections[pkg.id] === "transféré" && (
        <div className="mt-2">
          <select
            value={transferSelections[pkg.id] || ""}
            onChange={(e) => setTransferSelections({ ...transferSelections, [pkg.id]: Number(e.target.value) })}
            className="border p-1 rounded w-full"
          >
            <option value="">-- Choisir un livreur --</option>
            {livreurs
              .filter((l) => l.id !== livreurId)
              .map((livreur) => (
                <option key={livreur.id} value={livreur.id}>
                  {livreur.userFirstName} {livreur.userLastName}
                </option>
              ))}
          </select>

          <input
            placeholder="Adresse"
            className="border p-1 w-full mt-1"
            value={transferAddresses[pkg.id]?.address || ""}
            onChange={(e) =>
              setTransferAddresses({
                ...transferAddresses,
                [pkg.id]: { ...transferAddresses[pkg.id], address: e.target.value },
              })
            }
          />
          <input
            placeholder="Code postal"
            className="border p-1 w-full mt-1"
            value={transferAddresses[pkg.id]?.postalCode || ""}
            onChange={(e) =>
              setTransferAddresses({
                ...transferAddresses,
                [pkg.id]: { ...transferAddresses[pkg.id], postalCode: e.target.value },
              })
            }
          />
          <input
            placeholder="Ville"
            className="border p-1 w-full mt-1"
            value={transferAddresses[pkg.id]?.city || ""}
            onChange={(e) =>
              setTransferAddresses({
                ...transferAddresses,
                [pkg.id]: { ...transferAddresses[pkg.id], city: e.target.value },
              })
            }
          />

          {transferCodes[pkg.id] && (
            <p className="text-green-600 font-semibold mt-2">Code de transfert : {transferCodes[pkg.id]}</p>
          )}

          {transferCodes[pkg.id] && transferSelections[pkg.id] && (
            <Link
              href={`/dashboard/livreur/chat/${transferSelections[pkg.id]}?packageId=${pkg.id}&code=${transferCodes[pkg.id]}`}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-700 rounded hover:bg-blue-50 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Contacter le livreur n°{transferSelections[pkg.id]}
            </Link>
          )}
        </div>
      )}
      {statusSelections[pkg.id] === "livré" && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Code de livraison"
            className="border p-1 w-full"
            value={codes[pkg.id] || ""}
            onChange={(e) => setCodes({ ...codes, [pkg.id]: e.target.value })}
          />

          <button
            onClick={() => handleConfirmDelivery(pkg.id)}
            disabled={!codes[pkg.id]?.trim()}
            className={`mt-2 px-4 py-2 rounded text-white transition-colors ${
              !codes[pkg.id]?.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Confirmer la livraison
          </button>
        </div>
      )}



      <button
        onClick={() => router.push(`/dashboard/livreur/announcementPage/${pkg.advertisementId}`)}
        className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Voir détail
      </button>

      <button
        onClick={() => handleStatusUpdate(pkg.id)}
        disabled={statusSelections[pkg.id] === "livré"}
        className={`mt-4 px-4 py-2 rounded text-white transition-colors ${
          statusSelections[pkg.id] === "livré"
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        Mettre à jour le statut
      </button>



      {clientIds[pkg.id] && (
        <Link
          href={`/dashboard/livreur/chat/${clientIds[pkg.id]}?packageId=${pkg.id}`}
          className="mt-2 ml-2 inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Contacter le client
        </Link>
      )}
    </>
  )


  useEffect(() => {
    const fetchClientIds = async () => {
      const newClientIds: { [key: number]: number | null } = {}

      for (const pkg of packages) {
        if (pkg.advertisementId) {
          const clientId = await getClientIdFromAdvertisement(pkg.advertisementId)
          newClientIds[pkg.id] = clientId
        }
      }

      setClientIds(newClientIds)
    }

    if (packages.length > 0) {
      fetchClientIds()
    }
  }, [packages])

  if (loading) return <p>Chargement...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📦 Mes Colis (En cours & Transferts)</h1>

      {packages.length === 0 ? (
        <p>Aucun colis pour l'instant.</p>
      ) : (
        <>
          {/* SECTION 1 - COLIS EN COURS */}
          <h2 className="text-lg font-semibold mt-4 mb-2">🚚 Colis en cours</h2>
          <ul>
            {packages 
            .filter(
              (pkg) =>
                (pkg.deliveryStatus === "en cours" || pkg.deliveryStatus === "en transit") &&
                !(transferInfos[pkg.id]?.toCourierId === livreurId && !transferInfos[pkg.id]?.isConfirmed)
            )
            .map((pkg) => (
              <li key={pkg.id} className="border p-4 mb-4 rounded shadow">
                {renderPackage(pkg)}
              </li>
            ))}

          </ul>

          {/* SECTION 2 - COLIS EN TRANSFERT À VALIDER */}
          <h2 className="text-lg font-semibold mt-6 mb-2">🔁 Colis transférés à valider</h2>
          <ul>
            {packages
              .filter(
                (pkg) =>
                  transferInfos[pkg.id]?.toCourierId === livreurId &&
                  !transferInfos[pkg.id]?.isConfirmed
              )
              .map((pkg) => (
                <li key={pkg.id} className="border p-4 mb-4 rounded shadow">
                  {renderPackage(pkg)}
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  )

}
