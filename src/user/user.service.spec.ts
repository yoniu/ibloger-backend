import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository;
  let mockJwtService;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully create a new user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(createUserDto);
      mockUserRepository.save.mockResolvedValue({
        ...createUserDto,
        id: 1,
        password: 'hashedPassword',
      });

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedPassword'));

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        ...createUserDto,
        id: 1,
        password: 'hashedPassword',
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should throw ConflictException if username or email exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'user',
    };

    it('should successfully login a user with username', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login({
        username: loginUserDto.username,
        password: loginUserDto.password,
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    });

    it('should successfully login a user with email', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login({
        email: loginUserDto.email,
        password: loginUserDto.password,
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          username: loginUserDto.username,
          password: loginUserDto.password,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(
        service.login({
          username: loginUserDto.username,
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
