import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { CategoriesService } from '../categories/categories.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: jest.Mocked<Repository<Transaction>>;
  let categoriesService: jest.Mocked<CategoriesService>;

  const mockTransaction: Transaction = {
    id: 'transaction-uuid',
    description: 'Uber',
    amount: 25.50,
    type: TransactionType.EXPENSE,
    date: new Date(),
    categoryId: 'category-uuid',
    userId: 'user-uuid',
    createdAt: new Date(),
    category: {} as any,
    user: {} as any,
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const mockCategoriesService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepository,
        },
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repository = module.get(getRepositoryToken(Transaction));
    categoriesService = module.get(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar apenas as transações do usuário autenticado e metadados', async () => {
      const mockQuery = { page: 1, limit: 10 };
      repository.findAndCount.mockResolvedValue([[mockTransaction], 1]);

      const result = await service.findAll('user-uuid', mockQuery);

      expect(repository.findAndCount).toHaveBeenCalled();
      expect(result.data).toEqual([mockTransaction]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });
});
