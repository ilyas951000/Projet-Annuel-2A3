"use client"
import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

type CompanyDetail = {
  companyName: string;
  legalStructure: string;
  siren: string;
  dateOfIncorporation: string;            // ISO string
  registeredOfficeAddressStreet: string;
  registeredOfficeAddressCity: string;
  registeredOfficeAddressPostalCode: string;
  startDateOfActivity: string;            // ISO string
  currentYear: string;
};

export default function PDFDownloader() {
  const [loading, setLoading] = useState(false);

  const fetchCompanyDetail = async (id: number): Promise<CompanyDetail> => {
    const res = await fetch(`/api/company-detail/${id}`);
    if (!res.ok) throw new Error("Impossible de charger les détails");
    return res.json();
  };

  const generatePDF = async () => {
    setLoading(true);
    try {
      // 1. fetch des données (ici id = 1 à titre d'exemple)
      const data = await fetchCompanyDetail(2);

      // 2. création du PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // 3. formatage des dates
      const incDate = new Date(data.dateOfIncorporation).toLocaleDateString("fr-FR");
      const startDate = new Date(data.startDateOfActivity).toLocaleDateString("fr-FR");
      const today = new Date().toLocaleDateString("fr-FR");

      // 4. insertion du texte dynamique
      page.drawText(`Contrat de Commerçant – EcoDeli`, {
        x: 50, y: height - 80, size: 20, font, color: rgb(0, 0.53, 0.21),
      });
      page.drawText(`Société: ${data.companyName} (${data.legalStructure})`, {
        x: 50, y: height - 120, font, size: 14,
      });
      page.drawText(`SIREN: ${data.siren}`, {
        x: 50, y: height - 140, font, size: 14,
      });
      page.drawText(`Date d'incorporation: ${incDate}`, {
        x: 50, y: height - 160, font, size: 14,
      });
      page.drawText(
        `Adresse du siège: ${data.registeredOfficeAddressStreet}, ${data.registeredOfficeAddressPostalCode} ${data.registeredOfficeAddressCity}`,
        { x: 50, y: height - 180, font, size: 12, maxWidth: 500, lineHeight: 14 }
      );
      page.drawText(`Début d'activité: ${startDate}`, {
        x: 50, y: height - 210, font, size: 14,
      });
      page.drawText(`Exercice en cours: ${data.currentYear}`, {
        x: 50, y: height - 230, font, size: 14,
      });
      page.drawText(`Généré le: ${today}`, {
        x: 50, y: height - 250, font, size: 12,
      });

      // 5. clauses contractuelles
      page.drawText(`Ce contrat est établi entre EcoDeli et le commerçant pour l’usage des services de livraison.`, {
        x: 50, y: height - 290, font, size: 12, maxWidth: 500, lineHeight: 16,
      });
      // … autres clauses

      // 6. sauvegarde et téléchargement
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "contrat-ecodeli.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Erreur génération PDF :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold mb-6">
        Bienvenue Chez <span className="text-black">Eco</span>
        <span className="text-green-500">Deli</span> Commerçant
      </h2>
      <div className="p-6 bg-white rounded-md shadow max-w-3xl mx-auto">
        <button
          onClick={generatePDF}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Chargement..." : "Générer et Télécharger le contrat"}
        </button>
      </div>
    </div>
  );
}
