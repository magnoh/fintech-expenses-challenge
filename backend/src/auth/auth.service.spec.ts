import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 'user-uuid',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    categories: [],
    transactions: [],
  };

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('deve cadastrar um novo usuário com sucesso', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      
      const expectedUser = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      };

      usersService.create.mockResolvedValue(expectedUser as any);

      const result = await service.register(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso e retornar token JWT', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('deve lançar UnauthorizedException se a senha for inválida', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      usersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
