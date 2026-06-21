import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction, TransactionType } from '../transactions/entities/transaction.entity';
import { GetDashboardDto } from './dto/get-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  async getDashboardData(userId: string, query: GetDashboardDto) {
    const { startDate, endDate } = query;

    // 1. Calcular Saldo Atual (absoluto - todas as transações)
    const allTransactions = await this.transactionsRepository.find({
      where: { userId },
    });

    let currentBalance = 0;
    allTransactions.forEach((t) => {
      if (t.type === TransactionType.INCOME) {
        currentBalance += t.amount;
      } else {
        currentBalance -= t.amount;
      }
    });

    // 2. Determinar período
    const start = startDate ? new Date(startDate) : new Date('1970-01-01');
    const end = endDate ? new Date(endDate) : new Date();
    if (endDate && !endDate.includes('T')) {
      end.setHours(23, 59, 59, 999);
    }

    // 3. Transações do período
    const periodTransactions = await this.transactionsRepository.find({
      where: {
        userId,
        date: Between(start, end),
      },
      relations: ['category'],
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryExpensesMap: Record<string, { name: string; amount: number }> = {};

    periodTransactions.forEach((t) => {
      if (t.type === TransactionType.INCOME) {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
        
        const categoryId = t.categoryId;
        const categoryName = t.category?.name || 'Sem Categoria';
        
        if (!categoryExpensesMap[categoryId]) {
          categoryExpensesMap[categoryId] = {
            name: categoryName,
            amount: 0,
          };
        }
        categoryExpensesMap[categoryId].amount += t.amount;
      }
    });

    const topCategories = Object.values(categoryExpensesMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)
      .map((cat) => ({
        name: cat.name,
        amount: parseFloat(cat.amount.toFixed(2)),
      }));

    return {
      currentBalance: parseFloat(currentBalance.toFixed(2)),
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      topCategories,
    };
  }
}
