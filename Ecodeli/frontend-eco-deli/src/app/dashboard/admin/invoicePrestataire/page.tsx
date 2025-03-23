'use client';

import { useEffect, useState } from 'react';

interface Invoice {
  id: number;
  invoiceNumber: number;
  issueDate: Date;
  paymentDate: Date;
  totalAmount: string;
  paymentStatus: boolean;
  paymentMethod: string;
  serviceTitle: string;
}

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const response = await fetch('http://localhost:3001/invoices');
      const data = await response.json();
      setInvoices(data);
    };

    fetchInvoices();
  }, []);

  const download = (id: number) => {
    console.log(`Téléchargement de la facture avec l'ID: ${id}`);
  };

  const details = (id: number) => {
    console.log(`Téléchargement de la facture avec l'ID: ${id}`);
  };
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Invoices</h1>
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
            <tr className="bg-gray-200">
            <th className="px-4 py-2 border border-gray-300">ID</th>
            <th className="px-4 py-2 border border-gray-300">Invoice Number</th>
            <th className="px-4 py-2 border border-gray-300">Issue Date</th>
            <th className="px-4 py-2 border border-gray-300">Payment Date</th>
            <th className="px-4 py-2 border border-gray-300">Total Amount</th>
            <th className="px-4 py-2 border border-gray-300">Payment Status</th>
            <th className="px-4 py-2 border border-gray-300">Payment Method</th>
            <th className="px-4 py-2 border border-gray-300">Service Title</th>
            <th className="px-4 py-2 border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="bg-white">
              <td className="px-4 py-2 border border-gray-300">{invoice.id}</td>
              <td className="px-4 py-2 border border-gray-300">{invoice.invoiceNumber}</td>
              <td className="px-4 py-2 border border-gray-300">{formatDate(invoice.issueDate)}</td>
              <td className="px-4 py-2 border border-gray-300">{formatDate(invoice.paymentDate)}</td>
              <td className="px-4 py-2 border border-gray-300">{invoice.totalAmount} €</td>
              <td className="px-4 py-2 border border-gray-300">{invoice.paymentStatus ? 'Paid' : 'Unpaid'}</td>
              <td className="px-4 py-2 border border-gray-300">{invoice.paymentMethod}</td>
              <td className="px-4 py-2 border border-gray-300">{invoice.serviceTitle}</td>
              <td className="px-4 py-2 border border-gray-300 text-center">
                <span className='px-4'>
                    <button
                    onClick={() => download(invoice.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                    Download
                    </button>
                </span>

                <span className='px-4'>
                    <button
                    onClick={() => details(invoice.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                    Details/Modifier
                    </button>
                </span>
              </td> 
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoicesPage;
