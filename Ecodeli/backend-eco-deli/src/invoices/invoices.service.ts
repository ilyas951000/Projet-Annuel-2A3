import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { Invoice } from './entities/invoice.entity';
import { Transfer } from '../payments/entities/transfer.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { User } from 'src/users/entities/user.entity';

const PDFDocument = require('pdfkit');

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,

    @InjectRepository(Transfer)
    private transferRepository: Repository<Transfer>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    if (!createInvoiceDto.userId) {
      throw new Error('userId est requis pour créer une facture');
    }

    if (!createInvoiceDto.invoiceNumber || createInvoiceDto.invoiceNumber.trim() === '') {
      createInvoiceDto.invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }

    const invoice = this.invoicesRepository.create(createInvoiceDto);
    return this.invoicesRepository.save(invoice);
  }

  findAll() {
    return this.invoicesRepository.find();
  }

  findOne(id: number) {
    return this.invoicesRepository.findOneBy({ id });
  }

  update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesRepository.update(id, updateInvoiceDto);
  }

  remove(id: number) {
    return this.invoicesRepository.delete(id);
  }

  async getInvoiceHistoryByUser(
    userId: number,
    sortBy = 'issueDate',
    order: 'ASC' | 'DESC' = 'DESC',
    status?: 'paid' | 'unpaid',
    month?: number,
    year?: number,
  ) {
    const qb = this.invoicesRepository
      .createQueryBuilder('invoice')
      .where('invoice.userId = :userId', { userId });

    if (status === 'paid') qb.andWhere('invoice.paymentStatus = true');
    if (status === 'unpaid') qb.andWhere('invoice.paymentStatus = false');

    if (month && year) {
      qb.andWhere('EXTRACT(MONTH FROM invoice.issueDate) = :month', { month });
      qb.andWhere('EXTRACT(YEAR FROM invoice.issueDate) = :year', { year });
    }

    return qb.orderBy(`invoice.${sortBy}`, order).getMany();
  }

  async generateInvoicePdf(invoiceId: number, res: Response) {
    try {
      const invoice = await this.invoicesRepository.findOne({
        where: { id: invoiceId },
        relations: ['items'],
      });

      if (!invoice) {
        res.status(404).send('Facture introuvable');
        return;
      }

      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=facture-${invoiceId}.pdf`);
      doc.pipe(res);

      doc
        .font('Courier-Bold')
        .fontSize(16)
        .text('Ecodeli SARL', { align: 'left' })
        .font('Courier')
        .fontSize(10)
        .text('123 Rue de l’arnaque, 75000 Paris')
        .text('contact@ecodeli.fr | +33 1 23 45 67 89');

      doc.moveDown();

      doc
        .font('Courier-Bold')
        .fontSize(20)
        .text('FACTURE', { align: 'right' });

      doc
        .font('Courier')
        .fontSize(10)
        .text(`Facture N° : ${invoice.invoiceNumber}`, { align: 'right' })
        .text(`Date : ${new Date(invoice.issueDate).toLocaleDateString()}`, { align: 'right' });

      doc.moveDown();

      doc
        .font('Courier-Bold')
        .fontSize(12)
        .text('Informations client :', { underline: true });

      doc
        .font('Courier')
        .fontSize(11)
        .text(`Type d'utilisateur : ${invoice.userType}`)
        .text(`ID utilisateur : ${invoice.userId}`)
        .text(`Méthode de paiement : ${invoice.paymentMethod}`)
        .text(`Service : ${invoice.serviceTitle}`);

      doc.moveDown();

      const status = invoice.paymentStatus ? '✅ Payé' : '❌ Non payé';
      const statusColor = invoice.paymentStatus ? 'green' : 'red';

      doc
        .fillColor(statusColor)
        .font('Courier-Bold')
        .fontSize(12)
        .text(`Statut de paiement : ${status}`);

      doc.fillColor('black');

      doc.moveDown();

      if (invoice.items?.length) {
        doc
          .font('Courier-Bold')
          .fontSize(12)
          .text('Détails de la facture :', { underline: true });

        doc.moveDown(0.5);

        const tableTop = doc.y;
        const itemX = 60;
        const descX = 100;
        const amountX = 470;

        doc
          .font('Courier-Bold')
          .fontSize(10)
          .text('N°', itemX, tableTop)
          .text('Description', descX, tableTop)
          .text('Montant (€)', amountX, tableTop, { align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#cccccc').stroke();

        doc.font('Courier').fontSize(10);
        let y = tableTop + 25;
        invoice.items.forEach((item, i) => {
          doc
            .text(`${i + 1}`, itemX, y)
            .text(item.description, descX, y)
            .text(`${item.amount} €`, amountX, y, { align: 'right' });
          y += 20;
        });
      }

      doc.moveDown(2);
      doc
        .font('Courier-Bold')
        .fontSize(12)
        .text(`Total à payer par le client: ${parseFloat(invoice.totalAmount).toFixed(2)} € `, { align: 'right' } );

      doc.moveDown(3);
      doc
        .fontSize(10)
        .fillColor('gray')
        .font('Courier')
        .text("Merci pour votre confiance.", { align: 'center' });

      doc.end();
    } catch (error) {
      console.error('Erreur génération PDF :', error);
      if (!res.headersSent) {
        res.status(500).send('Erreur serveur lors de la génération de la facture');
      }
    }
  }

  

  async createFromTransfer(transferId: number) {
    const transfer = await this.transferRepository.findOne({
      where: { id: transferId },
      relations: ['client', 'provider', 'provider.prestataireRole'], // Charger le rôle si dispo
    });

    if (!transfer || !transfer.client || !transfer.provider) {
      throw new NotFoundException('Transfert, client ou prestataire introuvable');
    }

    const clientInvoiceNumber = `INV-CL-${transfer.id}`;
    const providerInvoiceNumber = `INV-PR-${transfer.id}`;

    const [existingClient, existingProvider] = await Promise.all([
      this.invoicesRepository.findOne({ where: { invoiceNumber: clientInvoiceNumber } }),
      this.invoicesRepository.findOne({ where: { invoiceNumber: providerInvoiceNumber } }),
    ]);

    const created: Invoice[] = [];

    // --- Facture client ---
    if (!existingClient) {
      const clientInvoice = this.invoicesRepository.create({
        invoiceNumber: clientInvoiceNumber,
        issueDate: new Date(transfer.requestedAt),
        paymentDate: new Date(transfer.requestedAt),
        totalAmount: Number(transfer.amount).toFixed(2),
        paymentStatus: true,
        paymentMethod: 'in-app',
        serviceTitle: `Facture client pour transfert #${transfer.id}`,
        userType: 'client',
        userId: transfer.client.id,
      });

      await this.invoicesRepository.save(clientInvoice);
      created.push(clientInvoice);
    }

    // --- Récupération du fallback depuis userStatus si prestataireRole est absent ---
    let rawRole = transfer.provider.prestataireRole?.name?.toLowerCase();

    if (!rawRole) {
      const providerUser = await this.userRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.userStatus'])
        .where('user.id = :id', { id: transfer.provider.id })
        .getOne();

      rawRole = providerUser?.userStatus?.toLowerCase() || 'prestataire'; // fallback final
    }

    console.log(`🔍 Rôle détecté pour le provider ${transfer.provider.id}: ${rawRole}`);

    // --- Facture provider ---
    if (!existingProvider) {
      const roleLabel = rawRole.charAt(0).toUpperCase() + rawRole.slice(1);

      const providerInvoice = this.invoicesRepository.create({
        invoiceNumber: providerInvoiceNumber,
        issueDate: new Date(transfer.requestedAt),
        paymentDate: new Date(transfer.requestedAt),
        totalAmount: Number(transfer.amount).toFixed(2),
        paymentStatus: true,
        paymentMethod: 'in-app',
        serviceTitle: `Facture ${rawRole} pour transfert #${transfer.id}`,
        userType: rawRole,
        userId: transfer.provider.id,
      });

      await this.invoicesRepository.save(providerInvoice);
      created.push(providerInvoice);
    }

    return created;
  }



  async createMonthlyInvoiceForUser(userId: number, month: number, year: number) {
    const payments = await this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.client', 'client')
      .where('client.id = :userId', { userId })
      .andWhere('MONTH(transfer.requestedAt) = :month', { month })
      .andWhere('YEAR(transfer.requestedAt) = :year', { year })
      .andWhere('transfer.isValidatedByClient = true')
      .getMany();

    if (!payments.length) {
      throw new NotFoundException('Aucun paiement trouvé pour ce mois.');
    }

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const invoiceNumber = `INV-CL-MONTH-${year}${month}-${userId}`;

    const existing = await this.invoicesRepository.findOne({ where: { invoiceNumber } });
    if (existing) return existing;

    const invoice = this.invoicesRepository.create({
      invoiceNumber,
      issueDate: new Date(),
      paymentDate: new Date(),
      totalAmount: Number(total).toFixed(2),
      paymentStatus: true,
      paymentMethod: 'in-app',
      serviceTitle: `Facturation mensuelle client - ${month}/${year}`,
      userType: 'client',
      userId,
    });

    return this.invoicesRepository.save(invoice);
  }

  async createMonthlyInvoiceForProvider(userId: number, month: number, year: number) {
    const payments = await this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.provider', 'provider')
      .where('provider.id = :userId', { userId })
      .andWhere('MONTH(transfer.requestedAt) = :month', { month })
      .andWhere('YEAR(transfer.requestedAt) = :year', { year })
      .andWhere('transfer.isValidatedByClient = true')
      .getMany();

    if (!payments.length) {
      throw new NotFoundException('Aucun paiement prestataire trouvé pour ce mois.');
    }

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const invoiceNumber = `INV-PR-MONTH-${year}${month}-${userId}`;

    const existing = await this.invoicesRepository.findOne({ where: { invoiceNumber } });
    if (existing) return existing;

    const invoice = this.invoicesRepository.create({
      invoiceNumber,
      issueDate: new Date(),
      paymentDate: new Date(),
      totalAmount: Number(total).toFixed(2),
      paymentStatus: true,
      paymentMethod: 'in-app',
      serviceTitle: `Facturation mensuelle prestataire - ${month}/${year}`,
      userType: 'prestataire',
      userId,
    });

    return this.invoicesRepository.save(invoice);
  }

  async generateMonthlySummaryPdf(month: number, year: number, res: Response) {
    const invoices = await this.invoicesRepository
      .createQueryBuilder("invoice")
      .where('EXTRACT(MONTH FROM invoice.issueDate) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM invoice.issueDate) = :year', { year })
      .andWhere('invoice.invoiceNumber NOT LIKE :monthPattern', { monthPattern: 'INV-%-MONTH-%' })
      .orderBy('invoice.issueDate', 'ASC')
      .getMany();

    if (invoices.length === 0) {
      throw new NotFoundException('Aucune facture trouvée pour cette période.');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facturation-${month}-${year}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text(`🧾 Facturation mensuelle - ${month}/${year}`, { align: 'center' });
    doc.moveDown();

    let total = 0;

    invoices.forEach((inv, idx) => {
      doc.fontSize(12).text(`${idx + 1}. ${inv.invoiceNumber} - ${inv.serviceTitle}`);
      doc.text(`   Montant : ${inv.totalAmount} €`);
      doc.text(`   Statut : ${inv.paymentStatus ? 'Payé' : 'Non payé'}`);
      doc.text(`   Date : ${new Date(inv.issueDate).toLocaleDateString()}`);
      doc.moveDown(0.5);
      total += parseFloat(inv.totalAmount);
    });

    doc.moveDown();
    doc.fontSize(14).text(`💰 Total général : ${total.toFixed(2)} €`, { align: 'right' });
    doc.end();
  }

  async ensureProviderInvoicesExist(providerId: number) {
    const transfers = await this.transferRepository.find({
      where: {
        provider: { id: providerId },
        isValidatedByClient: true,
      },
      relations: ['client', 'provider'],
    });

    for (const transfer of transfers) {
      const invoiceNumber = `INV-PR-${transfer.id}`;

      const existing = await this.invoicesRepository.findOne({
        where: {
          userId: providerId,
          userType: 'prestataire',
          invoiceNumber,
        },
      });

      if (!existing) {
        const invoice = this.invoicesRepository.create({
          invoiceNumber,
          issueDate: new Date(transfer.requestedAt),
          paymentDate: new Date(transfer.requestedAt),
          totalAmount: Number(transfer.amount).toFixed(2),
          paymentStatus: true,
          paymentMethod: 'in-app',
          serviceTitle: `Facture prestataire pour transfert #${transfer.id}`,
          userType: 'prestataire',
          userId: providerId,
        });

        await this.invoicesRepository.save(invoice);
      }
    }
  }
}
