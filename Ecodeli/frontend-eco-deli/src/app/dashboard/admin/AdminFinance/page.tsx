"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { getCurrentMonth, getCurrentTargetYear } from "../../../utils/currentTime" // adapte le chemin selon ton projet

type Overview = {
  totalRevenue: number
  totalTransfers: number
}

type PlatformFee = {
  id: number
  packageId: number
  amount: number
  createdAt: string
}

type Transfer = {
  id: number
  clientName: string
  providerName: string
  amount: number
  status: string
  requestedAt: string
}

export default function AdminFinancePage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [fees, setFees] = useState<PlatformFee[]>([])
  const [totalPlatformFees, setTotalPlatformFees] = useState<number>(0)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const currentMonth = getCurrentMonth()
  const currentYear = getCurrentTargetYear()


  const MonthlyRevenue = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [revenue, setRevenue] = useState<number>(0)
    const [monthlyFees, setMonthlyFees] = useState<number>(0)
    const [monthlyTransfers, setMonthlyTransfers] = useState<number>(0)

    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ]

    useEffect(() => {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/provider/admin/monthly-revenue?month=${selectedMonth}&year=${selectedYear}`, { headers })
    .then(res => res.json())
    .then(data => {
      setRevenue(data.totalRevenue ?? 0);
      setMonthlyTransfers(data.totalTransfers ?? 0);
      setMonthlyFees((data.totalFees ?? 0) + (data.subscriptionRevenue ?? 0));
    })
    .catch(err => {
      console.error("Erreur chargement revenu mensuel:", err);
    });
}, [selectedMonth, selectedYear]);


    
        

    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <h2 className="text-xl font-bold">Résumé du mois de {months[selectedMonth - 1]} {selectedYear}</h2>

        <div className="flex gap-4 mb-4">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="p-2 border rounded"
          >
            {months.map((name, idx) => {
              const monthValue = idx + 1;
              const isDisabled =
                selectedYear === currentYear && monthValue > currentMonth;

              return (
                <option key={monthValue} value={monthValue} disabled={isDisabled}>
                  {name}
                </option>
              );
            })}
          </select>


          <input
            type="number"
            value={selectedYear}
            min={2000}
            max={currentYear}
            onChange={e => {
              const newYear = Number(e.target.value)
              if (newYear <= currentYear) {
                setSelectedYear(newYear)

                // Si année en cours et mois sélectionné > mois actuel → réajuste
                if (newYear === currentYear && selectedMonth > currentMonth) {
                  setSelectedMonth(currentMonth)
                }
              }
            }}
            className="p-2 border rounded"
          />

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Revenus mensuels" value={revenue} />
          <StatCard title="Frais de plateforme + Abonnements (mois)" value={monthlyFees} />
          <StatCard title="Virements envoyés (mois)" value={monthlyTransfers} />
        </div>
      </div>
    )
  }

  useEffect(() => {
    const token = localStorage.getItem("token")

    const fetchData = async () => {
      try {
        const [revenueRes, feesRes, totalFeesRes, transfersRes, totalTransfersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/provider/admin/total-revenue`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/finance/platform-fees`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/platform-fees-overview`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/finance/transfers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/provider/admin/total-transfers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const revenueData = await revenueRes.json()
        const feesData = await feesRes.json()
        const totalFeesData = await totalFeesRes.json()
        const transfersData = await transfersRes.json()
        const transfersTotal = await totalTransfersRes.json()

        setOverview({
          totalRevenue: parseFloat(revenueData),
          totalTransfers: parseFloat(transfersTotal),
        })

        setFees(Array.isArray(feesData) ? feesData : feesData.data || [])
        setTotalPlatformFees(parseFloat(totalFeesData?.total || 0))
        setTransfers(Array.isArray(transfersData) ? transfersData : transfersData.data || [])
      } catch (err) {
        console.error("Erreur chargement finance admin:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <Loader2 className="animate-spin mr-2" />
        Chargement des données...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Tableau de bord financier</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Revenus totaux" value={overview?.totalRevenue ?? 0} />
        <StatCard title="Frais de plateforme + Abonnements" value={totalPlatformFees} />
        <StatCard title="Virements envoyés" value={overview?.totalTransfers ?? 0} />
      </div>

      <MonthlyRevenue />

      <section>
        <h2 className="text-xl font-semibold mb-2">Frais de plateforme</h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Colis</th>
                <th className="px-4 py-2">Montant (€)</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {fees.length > 0 ? (
                fees.map((fee) => (
                  <tr key={fee.id} className="border-t">
                    <td className="px-4 py-2">#{fee.packageId}</td>
                    <td className="px-4 py-2">{fee.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">{new Date(fee.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                    Aucun frais enregistré
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Virements prestataires</h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Prestataire</th>
                <th className="px-4 py-2">Montant (€)</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length > 0 ? (
                transfers.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-2">{t.clientName}</td>
                    <td className="px-4 py-2">{t.providerName}</td>
                    <td className="px-4 py-2">{t.amount.toFixed(2)}</td>
                    <td className="px-4 py-2 capitalize">{t.status}</td>
                    <td className="px-4 py-2">{new Date(t.requestedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                    Aucun virement trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-green-600 mt-1">{value.toFixed(2)} €</p>
    </div>
  )
}
