"use client"
import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function PDFDownloader() {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const text = `Contrat de Commercant – EcoDeli`;
      page.drawText(text, {
        x: 50,
        y: height - 80,
        size: 20,
        font,
        color: rgb(0, 0.53, 0.21),
      });

      page.drawText(`Client: Jean Dupont`, { x: 50, y: height - 120, font, size: 14 });
      page.drawText(`Date: ${new Date().toLocaleDateString("fr-FR")}`, {
        x: 50,
        y: height - 140,
        font,
        size: 14,
      });

      page.drawText(
        `Ce contrat est établi entre EcoDeli et le commerçant pour l'usage des services de livraison.`,
        {
          x: 50,
          y: height - 180,
          font,
          size: 12,
          maxWidth: 500,
          lineHeight: 16,
        }
      );

      page.drawText(`Conditions de prestation:`, { x: 50, y: height - 220, font, size: 14 });
      page.drawText(
        `- Livraison en 24h pour toute commande.`,
        {
          x: 50,
          y: height - 240,
          font,
          size: 12,
          maxWidth: 500,
          lineHeight: 16,
        }
      );
      page.drawText(
        `- Le commerçant s'engage à respecter les horaires de livraison.`,
        {
          x: 50,
          y: height - 260,
          font,
          size: 12,
          maxWidth: 500,
          lineHeight: 16,
        }
      );

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
      console.error("Erreur génération PDF:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
        Bienvenue Chez <span className="text-black">Eco</span>
        <span className="text-green-500">Deli</span> Commerçant - contrat
      </h2>

      <div className="p-6 bg-white dark:bg-gray-900 rounded-md shadow max-w-3xl mx-auto">
        <button
          onClick={generatePDF}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Chargement..." : "Générer et Télécharger le contrat entre Ecodeli et vous"}
        </button>
      </div>
    </div>
  );
}
