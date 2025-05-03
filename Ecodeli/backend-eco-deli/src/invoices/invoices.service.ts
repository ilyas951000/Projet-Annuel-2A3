import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
  ) {}

  create(createInvoiceDto: CreateInvoiceDto) {
    const invoice = this.invoicesRepository.create(createInvoiceDto);
    return this.invoicesRepository.save(invoice);
  }

  findAll() {
    return this.invoicesRepository.find();
  }

  findOne(id: number) {
    return this.invoicesRepository.findOneBy({ id: id });
  }

  update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesRepository.update(id, updateInvoiceDto);
  }

  remove(id: number) {
    return this.invoicesRepository.delete(id);
  }
}
