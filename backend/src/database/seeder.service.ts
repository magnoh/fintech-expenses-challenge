import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Transaction, TransactionType } from '../transactions/entities/transaction.entity';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Verificando sementes de banco de dados...');
    
    // 1. Verificar se usuário admin existe
    const adminEmail = 'admin@fintech.com';
    let admin = await this.usersRepository.findOne({ where: { email: adminEmail } });

    if (!admin) {
      this.logger.log('Semeando usuário administrador de testes...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      admin = this.usersRepository.create({
        name: 'Administrador Fintech',
        email: adminEmail,
        password: hashedPassword,
      });
      admin = await this.usersRepository.save(admin);
      this.logger.log(`Usuário admin criado: ${adminEmail} (senha: 123456)`);

      // 2. Semear categorias padrão para este usuário
      this.logger.log('Semeando categorias de teste...');
      const categoriesData = [
        { name: 'Alimentação', description: 'Gastos com restaurantes, supermercado e lanches' },
        { name: 'Transporte', description: 'Uber, táxi, combustível e passagens' },
        { name: 'Fornecedor', description: 'Pagamento de prestadores de serviço e fornecedores' },
        { name: 'Receita de Cliente', description: 'Faturamento de serviços ou produtos vendidos' },
      ];

      const categories: Category[] = [];
      for (const catData of categoriesData) {
        const category = this.categoriesRepository.create({
          ...catData,
          userId: admin.id,
        });
        categories.push(await this.categoriesRepository.save(category));
      }
      this.logger.log(`${categories.length} categorias criadas.`);

      // 3. Semear transações de teste
      this.logger.log('Semeando transações de teste...');
      
      const alimentacao = categories.find(c => c.name === 'Alimentação')!;
      const transporte = categories.find(c => c.name === 'Transporte')!;
      const fornecedor = categories.find(c => c.name === 'Fornecedor')!;
      const receita = categories.find(c => c.name === 'Receita de Cliente')!;

      const transactionsData = [
        {
          description: 'Desenvolvimento de Landing Page',
          amount: 5500.00,
          type: TransactionType.INCOME,
          date: this.getDateDaysAgo(1),
          categoryId: receita.id,
          userId: admin.id,
        },
        {
          description: 'Consultoria Mensal Cliente Alpha',
          amount: 3200.00,
          type: TransactionType.INCOME,
          date: this.getDateDaysAgo(4),
          categoryId: receita.id,
          userId: admin.id,
        },
        {
          description: 'Almoço de Negócios com Fornecedor',
          amount: 185.50,
          type: TransactionType.EXPENSE,
          date: this.getDateDaysAgo(2),
          categoryId: alimentacao.id,
          userId: admin.id,
        },
        {
          description: 'Assinatura AWS Mensal',
          amount: 890.00,
          type: TransactionType.EXPENSE,
          date: this.getDateDaysAgo(3),
          categoryId: fornecedor.id,
          userId: admin.id,
        },
        {
          description: 'Viagem de Uber para Reunião',
          amount: 42.90,
          type: TransactionType.EXPENSE,
          date: this.getDateDaysAgo(1),
          categoryId: transporte.id,
          userId: admin.id,
        },
        {
          description: 'Licença Photoshop Team',
          amount: 320.00,
          type: TransactionType.EXPENSE,
          date: this.getDateDaysAgo(5),
          categoryId: fornecedor.id,
          userId: admin.id,
        },
      ];

      for (const transData of transactionsData) {
        const transaction = this.transactionsRepository.create(transData);
        await this.transactionsRepository.save(transaction);
      }
      this.logger.log('Transações de teste semeadas com sucesso.');
    } else {
      this.logger.log('Banco de dados já semeado previamente.');
    }
  }

  private getDateDaysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }
}
