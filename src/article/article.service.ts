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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createArticleDto: CreateArticleDto, user: User) {
    const category = await this.categoryRepository.findOne({
      where: { id: createArticleDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 检查 slug 是否已存在
    const existingArticle = await this.articleRepository.findOne({
      where: { slug: createArticleDto.slug },
    });
    if (existingArticle) {
      throw new ForbiddenException('文章路径已存在');
    }

    // 从数据库中获取完整的用户实体
    const author = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!author) {
      throw new NotFoundException('用户不存在');
    }

    const article = this.articleRepository.create({
      ...createArticleDto,
      category,
      author,
    });

    return this.articleRepository.save(article);
  }

  async findAll(user: User | null, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    let query = this.articleRepository.createQueryBuilder('article');

    if (!user) {
      // 未登录用户只能看公开文章
      query = query.where('article.isPublished = :isPublished', {
        isPublished: true,
      });
    } else if (user.role === UserRole.ADMIN) {
      // 管理员可以看所有文章
      // 不需要添加任何条件
    } else {
      // 普通用户可以看自己的所有文章和其他人的公开文章
      query = query.where(
        '(article.author.id = :userId) OR (article.isPublished = :isPublished)',
        {
          userId: user.id,
          isPublished: true,
        },
      );
    }

    const [articles, total] = await query
      .leftJoinAndSelect('article.author', 'articleAuthor')
      .leftJoinAndSelect('article.category', 'category')
      .skip(skip)
      .take(limit)
      .orderBy('article.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items: articles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, user: User) {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'category'],
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    if (
      user.role !== UserRole.ADMIN &&
      article.author.id !== user.id &&
      !article.isPublished
    ) {
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

    // 如果更新了 slug，检查是否与其他文章重复
    if (updateArticleDto.slug && updateArticleDto.slug !== article.slug) {
      const existingArticle = await this.articleRepository.findOne({
        where: { slug: updateArticleDto.slug },
      });
      if (existingArticle) {
        throw new ForbiddenException('文章路径已存在');
      }
    }

    Object.assign(article, updateArticleDto);
    return this.articleRepository.save(article);
  }

  async remove(id: number, user: User) {
    const article = await this.findOne(id, user);
    return this.articleRepository.remove(article);
  }
}
