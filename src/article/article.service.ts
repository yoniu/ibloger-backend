import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { UserRole } from '../user/enums/user-role.enum';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createArticleDto: CreateArticleDto, user: User) {
    const category = await this.categoryRepository.findOne({
      where: { id: createArticleDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    const article = this.articleRepository.create({
      ...createArticleDto,
      category,
      author: user,
    });

    return this.articleRepository.save(article);
  }

  async findAll(user: User) {
    if (user.role === UserRole.ADMIN) {
      return this.articleRepository.find();
    }
    return this.articleRepository.find({ where: { author: { id: user.id } } });
  }

  async findOne(id: number, user: User) {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'category'],
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    if (user.role !== UserRole.ADMIN && article.author.id !== user.id) {
      throw new ForbiddenException('没有权限访问此文章');
    }

    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto, user: User) {
    const article = await this.findOne(id, user);

    if (updateArticleDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateArticleDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('分类不存在');
      }
      article.category = category;
    }

    Object.assign(article, updateArticleDto);
    return this.articleRepository.save(article);
  }

  async remove(id: number, user: User) {
    const article = await this.findOne(id, user);
    return this.articleRepository.remove(article);
  }
}
