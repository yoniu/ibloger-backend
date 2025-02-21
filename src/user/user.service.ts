import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    // 检查用户名和邮箱是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    // 创建新用户
    const user = this.userRepository.create({
      username,
      email,
      password: await bcrypt.hash(password, 10),
    });

    return this.userRepository.save(user);
  }

  async login(loginUserDto: LoginUserDto) {
    const { username, email, password } = loginUserDto;

    // 根据用户名或邮箱查找用户
    const user = await this.userRepository.findOne({
      where: [
        ...(username ? [{ username }] : []),
        ...(email ? [{ email }] : []),
      ],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误');
    }

    // 生成 JWT token
    const payload = { id: user.id, username: user.username, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // 更新用户基本信息
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // 更新或创建用户配置文件
    if (!user.profile) {
      user.profile = this.userRepository.manager.create(UserProfile, {});
    }

    // 更新用户配置文件信息
    if (updateUserDto.nickname) user.profile.nickname = updateUserDto.nickname;
    if (updateUserDto.avatarUrl)
      user.profile.avatarUrl = updateUserDto.avatarUrl;
    if (updateUserDto.description)
      user.profile.description = updateUserDto.description;
    if (updateUserDto.phoneNumber)
      user.profile.phoneNumber = updateUserDto.phoneNumber;

    // 保存更新
    await this.userRepository.manager.save(user.profile);
    return this.userRepository.save(user);
  }

  async findAll(page: number, limit: number) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });

    return { users, total };
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);

    // 如果用户有关联的个人信息，先删除个人信息
    if (user.profile) {
      await this.userRepository.manager.remove(UserProfile, user.profile);
    }

    // 删除用户
    await this.userRepository.remove(user);
  }
}
