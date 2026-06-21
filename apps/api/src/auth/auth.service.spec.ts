import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { create: jest.Mock; findWithPassword: jest.Mock; findById: jest.Mock };
  let jwtService: { sign: jest.Mock };

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findWithPassword: jest.fn(),
      findById: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue('mock-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('creates a user and returns a token', async () => {
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        'testuser',
        'test@example.com',
        'password123',
      );
      expect(result.user).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      });
      expect(result.access_token).toBe('mock-token');
    });

    it('propagates ConflictException from UsersService', async () => {
      usersService.create.mockRejectedValue(
        new (require('@nestjs/common').ConflictException)('Username or email already exists'),
      );

      await expect(
        service.register({ username: 'test', email: 'test@test.com', password: 'pass' }),
      ).rejects.toThrow('Username or email already exists');
    });
  });

  describe('login', () => {
    it('returns token for valid credentials', async () => {
      usersService.findWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.access_token).toBe('mock-token');
      expect(result.user.id).toBe(1);
    });

    it('throws UnauthorizedException for invalid email', async () => {
      usersService.findWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for invalid password', async () => {
      usersService.findWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('returns user info for valid user id', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.validateUser(1);
      expect(result).toEqual({ id: 1, username: 'testuser', email: 'test@example.com' });
    });

    it('throws UnauthorizedException for invalid user id', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.validateUser(999)).rejects.toThrow(UnauthorizedException);
    });
  });
});
