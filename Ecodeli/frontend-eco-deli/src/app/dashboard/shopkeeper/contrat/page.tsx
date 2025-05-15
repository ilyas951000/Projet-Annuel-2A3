"use client"

import { useEffect, useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface CompanyDetail {
  companyName: string;
  legalStructure: string;
  siren: string;
  dateOfIncorporation: string;
  registeredOfficeAddressStreet: string;
  registeredOfficeAddressCity: string;
  registeredOfficeAddressPostalCode: string;
  startDateOfActivity: string;
  currentYear: string;
}

export default function PDFDownloader() {
  const [usersId, setUserId] = useState<number | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token manquant");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur récupération utilisateur");
        const data = await res.json();
        setUserId(data.userId);
      } catch (err: any) {
        setUserError(err.message);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  const fetchCompanyDetail = async (id: number): Promise<CompanyDetail> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/company-detail/user/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    if (!res.ok) throw new Error("Impossible de charger les détails de la société");
    return res.json();
  };
const generatePDF = async () => {
    if (userLoading || usersId === null) {
      console.warn("Utilisateur non chargé");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchCompanyDetail(usersId);

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const incDate = new Date(data.dateOfIncorporation).toLocaleDateString("fr-FR");
      const startDate = new Date(data.startDateOfActivity).toLocaleDateString("fr-FR");
      const today = new Date().toLocaleDateString("fr-FR");

      page.drawText(
        `Contrat de Commerçant – EcoDeli`,
        { x: 50, y: height - 80, size: 20, font, color: rgb(0, 0.53, 0.21) }
      );

      const entries = [
        { text: `Société: ${data.companyName}`, size: 14 },
        { text: `Forme Juridique: ${data.legalStructure}`, size: 14 },
        { text: `SIREN: ${data.siren}`, size: 14 },
        { text: `Date d'incorporation: ${incDate}`, size: 14 },
        {
          text: `Adresse du siège: ${data.registeredOfficeAddressStreet}, ${data.registeredOfficeAddressPostalCode} ${data.registeredOfficeAddressCity}`,
          size: 12,
          maxWidth: 500,
          lineHeight: 14,
        },
        { text: `Début d'activité: ${startDate}`, size: 14 },
        { text: `Exercice en cours: ${data.currentYear}`, size: 14 },
        { text: `Généré le: ${today}`, size: 12 },
        { text: `Objet du contrat :`, size: 20 },
        { 
          text: `Chaque commerçant souhaitant collaborer avec EcoDeli doit disposer d'un espace sécurisé et personnalisé lui permettant de gérer l'ensemble de ses interactions avec la plateforme, depuis la gestion de son contrat jusqu'au suivi des paiements. Cette interface doit offrir une vision claire et complète de toutes les étapes liées à son activité sur EcoDeli, et lui donner les outils nécessaires pour administrer ses annonces, sa facturation et ses transactions de manière autonome et efficace.`, 
          size: 12,
          maxWidth: 500, 
          lineHeight: 16
        }
      ];

      let currentY = height - 120;
      const defaultLineSpacing = 20;
      const defaultLineHeight = 16;

      const drawWrappedText = (text: string, options: {
        x: number;
        y: number;
        size: number;
        font: any;
        maxWidth?: number;
        lineHeight?: number;
      }) => {
        const { x, y, size, font, maxWidth, lineHeight = defaultLineHeight } = options;
        let currentLineY = y;
        
        if (!maxWidth) {
          page.drawText(text, { x, y: currentLineY, size, font });
          return currentLineY - lineHeight;
        }

        const words = text.split(' ');
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine + ' ' + word;
          const testWidth = font.widthOfTextAtSize(testLine, size);
          
          if (testWidth > maxWidth) {
            page.drawText(currentLine, { x, y: currentLineY, size, font });
            currentLineY -= lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        page.drawText(currentLine, { x, y: currentLineY, size, font });
        return currentLineY - lineHeight;
      };

      for (const { text, size, maxWidth, lineHeight } of entries) {
        currentY = drawWrappedText(text, {
          x: 50,
          y: currentY,
          size,
          font,
          maxWidth: maxWidth || undefined,
          lineHeight: lineHeight || defaultLineHeight
        });
        currentY -= 4;
      }

      currentY = drawWrappedText(
        `Ce contrat est établi entre EcoDeli et le commerçant pour l'usage des services de livraison.`,
        {
          x: 50,
          y: currentY,
          font,
          size: 12,
          maxWidth: 500,
          lineHeight: 16,
        }
      );

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'contrat-ecodeli.pdf';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

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
          disabled={loading || userLoading || !!userError}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Chargement..." : "Générer et Télécharger le contrat"}
        </button>
        {userError && <p className="mt-2 text-red-500">{userError}</p>}
      </div>
    </div>
  );
}