import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto): Promise<Transaction[]> {
    // Validar se categoria pertence ao usuário
    await this.categoriesService.findOne(createTransactionDto.categoryId, userId);

    const installmentsCount = createTransactionDto.installments && createTransactionDto.installments > 0 
      ? createTransactionDto.installments 
      : 1;

    const transactionsToSave: Transaction[] = [];
    const baseDate = new Date(createTransactionDto.date);

    for (let i = 0; i < installmentsCount; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setMonth(currentDate.getMonth() + i);

      const description = installmentsCount > 1 
        ? `${createTransactionDto.description} (${i + 1}/${installmentsCount})`
        : createTransactionDto.description;

      const transaction = this.transactionsRepository.create({
        ...createTransactionDto,
        description,
        userId,
        date: currentDate,
      });

      transactionsToSave.push(transaction);
    }

    return this.transactionsRepository.save(transactionsToSave);
  }

  async findAll(userId: string, query: GetTransactionsDto) {
    const { page, limit, type, categoryId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const whereConditions: FindOptionsWhere<Transaction> = { userId };

    if (type) {
      whereConditions.type = type;
    }

    if (categoryId) {
      whereConditions.categoryId = categoryId;
    }

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date();
      // Garantir o final do dia para a data final se for apenas a data
      if (endDate && !endDate.includes('T')) {
        end.setHours(23, 59, 59, 999);
      }
      whereConditions.date = Between(start, end);
    }

    const [data, total] = await this.transactionsRepository.findAndCount({
      where: whereConditions,
      relations: ['category'],
      order: { date: 'DESC', createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
      relations: ['category'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transação com ID "${id}" não encontrada.`);
    }

    return transaction;
  }

  async update(id: string, userId: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);

    if (updateTransactionDto.categoryId) {
      // Validar a nova categoria
      await this.categoriesService.findOne(updateTransactionDto.categoryId, userId);
    }

    const updatedData = { ...updateTransactionDto };
    if (updateTransactionDto.date) {
      (updatedData as any).date = new Date(updateTransactionDto.date);
    }

    Object.assign(transaction, updatedData);
    return this.transactionsRepository.save(transaction);
  }

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.findOne(id, userId);
    await this.transactionsRepository.remove(transaction);
  }
}
