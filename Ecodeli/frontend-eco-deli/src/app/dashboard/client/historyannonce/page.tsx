"use client";

import { useEffect, useState } from "react";

interface Transfer {
  id: number;
  amount: number;
  status: "pending" | "completed" | "failed" | "paid";
  isValidatedByClient: boolean;
  requestedAt: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: string;
  issueDate: string;
  paymentStatus: boolean;
}

export default function Page() {
  const [clientId, setClientId] = useState<number | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [message, setMessage] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [availableMonths, setAvailableMonths] = useState<{ month: number; year: number }[]>([]);
  const [sortBy, setSortBy] = useState<string>("requestedAt");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");

  useEffect(() => {
    const fetchClient = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setMessage("Token manquant");

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.userId) {
          setClientId(data.userId);
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
    if (clientId) {
      fetchTransfers();
      fetchInvoices();
    }
  }, [clientId]);

  const fetchTransfers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/client/${clientId}/history?sortBy=${sortBy}&order=${order}`
      );
      const data = await res.json();
      const validData = Array.isArray(data) ? data : [];
      setTransfers(validData);

      const months = Array.from(
        new Set(
          validData
            .filter((t: Transfer) => t.isValidatedByClient)
            .map((t: Transfer) => {
              const date = new Date(t.requestedAt);
              return `${date.getMonth() + 1}-${date.getFullYear()}`;
            })
        )
      ).map((key) => {
        const [month, year] = key.split("-").map(Number);
        return { month, year };
      });
      setAvailableMonths(months);
    } catch {
      setMessage("Erreur lors du chargement des transferts.");
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/client/${clientId}/history?sortBy=issueDate&order=DESC`
      );
      const data = await res.json();
      console.log("📦 DATA INVOICES:", data);

      const extracted =
        Array.isArray(data) ? data :
        Array.isArray(data.invoices) ? data.invoices :
        Array.isArray(data.data) ? data.data :
        Array.isArray(data.results) ? data.results :
        null;

      if (Array.isArray(extracted)) {
        setInvoices(extracted);
      } else {
        setInvoices([]);
        setMessage("Format inattendu des données de factures.");
      }
    } catch {
      setMessage("Erreur lors du chargement des factures.");
    }
  };

  const handleValidation = async (transferId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/validate/${transferId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      alert(data.message || "Transfert validé !");
      fetchTransfers();
    } catch {
      alert("Erreur lors de la validation.");
    }
  };

  const generateInvoiceForTransfer = async (transferId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/generate/single/${transferId}`,
        { method: "POST" }
      );
      const data = await res.json();
      console.log("🧾 Génération facture pour transfert :", data);

      const invoiceId = data?.id;
      if (invoiceId) {
        window.open(`${process.env.NEXT_PUBLIC_API_URL}/invoices/pdf/${invoiceId}`, "_blank");
        alert("Facture créée avec succès !");
        fetchInvoices();
      } else {
        alert("La facture n'a pas été générée correctement.");
      }
    } catch {
      alert("Erreur lors de la création de la facture.");
    }
  };

  const generateMonthlyInvoice = async () => {
    if (!selectedMonth || !selectedYear) return alert("Sélectionnez un mois et une année");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/generate/monthly/${clientId}?month=${selectedMonth}&year=${selectedYear}`,
        { method: "POST" }
      );
      const data = await res.json();
      console.log("🧾 Génération facture mensuelle :", data);

      const invoiceId = data?.id;
      if (invoiceId) {
        window.open(`${process.env.NEXT_PUBLIC_API_URL}/invoices/pdf/${invoiceId}`, "_blank");
        alert("Facture mensuelle créée !");
        fetchInvoices();
      } else {
        alert("La facture n'a pas été générée.");
      }
    } catch {
      alert("Erreur lors de la création de la facture mensuelle.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Historique des Paiements</h1>
      {message && <p className="text-red-600 mb-4">{message}</p>}

      <div className="bg-gray-100 p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">📊 Filtrer & trier</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2">
            <span className="text-sm">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="requestedAt">Date</option>
              <option value="amount">Montant</option>
              <option value="status">Statut</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="text-sm">Ordre :</span>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as "ASC" | "DESC")}
              className="border px-2 py-1 rounded"
            >
              <option value="DESC">Décroissant</option>
              <option value="ASC">Croissant</option>
            </select>
          </label>

          <button
            onClick={fetchTransfers}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Appliquer
          </button>
        </div>
      </div>

      {Array.isArray(transfers) && transfers.length === 0 ? (
        <p>Aucun transfert trouvé.</p>
      ) : (
        <ul className="space-y-4">
          {transfers.map((t) => (
            <li key={t.id} className="border p-4 rounded shadow flex justify-between items-center">
              <div>
                <p className="font-semibold">Transfert #{t.id}</p>
                <p>Montant : {t.amount} €</p>
                <p>Status : {t.status}</p>
                <p>Date : {new Date(t.requestedAt).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {t.isValidatedByClient ? (
                  <>
                    <span className="text-green-600 font-semibold">✅ Validé</span>
                    <button
                      onClick={() => generateInvoiceForTransfer(t.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Générer la facture
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleValidation(t.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Je valide le transfert
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-bold mt-10 mb-4">📜 Factures</h2>
      {Array.isArray(invoices) && invoices.length === 0 ? (
        <p>Aucune facture trouvée.</p>
      ) : (
        <ul className="space-y-4">
          {invoices.map((inv) => (
            <li key={inv.id} className="border p-4 rounded shadow">
              <p>Facture n°{inv.invoiceNumber}</p>
              <p>Montant : {inv.totalAmount} €</p>
              <p>Date : {new Date(inv.issueDate).toLocaleDateString("fr-FR")}</p>
              <p>Statut : {inv.paymentStatus ? "✅ Payé" : "❌ Non payé"}</p>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/invoices/pdf/${inv.id}`}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Télécharger PDF
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">📅 Générer une facture mensuelle</h3>
        {availableMonths.length === 0 ? (
          <p className="text-gray-600">Aucun mois disponible pour générer une facture.</p>
        ) : (
          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <select
              className="border px-2 py-1 rounded"
              value={`${selectedMonth}-${selectedYear}`}
              onChange={(e) => {
                const [month, year] = e.target.value.split("-").map(Number);
                setSelectedMonth(String(month));
                setSelectedYear(String(year));
              }}
            >
              <option value="">Choisir un mois</option>
              {availableMonths.map(({ month, year }) => (
                <option key={`${month}-${year}`} value={`${month}-${year}`}>
                  {new Date(year, month - 1).toLocaleString("fr-FR", { month: "long" })} {year}
                </option>
              ))}
            </select>

            <button
              onClick={generateMonthlyInvoice}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Générer la facture du mois
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
