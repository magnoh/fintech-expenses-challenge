import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: jest.Mocked<Repository<Category>>;

  const mockCategory: Category = {
    id: 'category-uuid',
    name: 'Alimentação',
    description: 'Refeições',
    userId: 'user-uuid',
    createdAt: new Date(),
    transactions: [],
    user: {} as any,
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get(getRepositoryToken(Category));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma nova categoria vinculada ao usuário', async () => {
      const createCategoryDto = {
        name: 'Alimentação',
        description: 'Refeições',
      };

      repository.create.mockReturnValue(mockCategory);
      repository.save.mockResolvedValue(mockCategory);

      const result = await service.create('user-uuid', createCategoryDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createCategoryDto,
        userId: 'user-uuid',
      });
      expect(repository.save).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as categorias do usuário informado', async () => {
      const mockCategories = [mockCategory];
      repository.find.mockResolvedValue(mockCategories);

      const result = await service.findAll('user-uuid');

      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: 'user-uuid' },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(mockCategories);
    });
  });
});
