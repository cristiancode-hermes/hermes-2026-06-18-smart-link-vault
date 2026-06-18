import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Link } from './link.entity';
import { Tag } from '../tags/tag.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { QueryLinkDto } from './dto/query-link.dto';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private readonly linksRepository: Repository<Link>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async create(dto: CreateLinkDto, userId: number): Promise<Link> {
    let tags: Tag[] = [];
    if (dto.tagIds && dto.tagIds.length > 0) {
      tags = await this.tagsRepository.findBy({ id: In(dto.tagIds) });
    }

    const link = this.linksRepository.create({
      url: dto.url,
      title: dto.title,
      description: dto.description ?? null,
      favicon: dto.favicon ?? null,
      userId,
      tags,
    });

    return this.linksRepository.save(link);
  }

  async findAllByUser(
    userId: number,
    query: QueryLinkDto,
  ): Promise<{ items: Link[]; total: number }> {
    const { search, tagId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (search) {
      where.title = Like(`%${search}%`);
    }

    const relations: any = { tags: true };

    let qb = this.linksRepository
      .createQueryBuilder('link')
      .leftJoinAndSelect('link.tags', 'tag')
      .where('link.userId = :userId', { userId });

    if (search) {
      qb = qb.andWhere('(link.title LIKE :search OR link.description LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (tagId) {
      qb = qb.andWhere('tag.id = :tagId', { tagId });
    }

    const [items, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('link.createdAt', 'DESC')
      .getManyAndCount();

    return { items, total };
  }

  async findById(id: number): Promise<Link> {
    const link = await this.linksRepository.findOne({
      where: { id },
      relations: { tags: true },
    });
    if (!link) {
      throw new NotFoundException('Link not found');
    }
    return link;
  }

  async update(
    id: number,
    dto: UpdateLinkDto,
    userId: number,
  ): Promise<Link> {
    const link = await this.findById(id);

    if (link.userId !== userId) {
      throw new ForbiddenException('You can only update your own links');
    }

    if (dto.url !== undefined) link.url = dto.url;
    if (dto.title !== undefined) link.title = dto.title;
    if (dto.description !== undefined) link.description = dto.description;
    if (dto.favicon !== undefined) link.favicon = dto.favicon;

    if (dto.tagIds !== undefined) {
      const tags = await this.tagsRepository.findBy({ id: In(dto.tagIds) });
      link.tags = tags;
    }

    return this.linksRepository.save(link);
  }

  async remove(id: number, userId: number): Promise<void> {
    const link = await this.findById(id);

    if (link.userId !== userId) {
      throw new ForbiddenException('You can only delete your own links');
    }

    await this.linksRepository.remove(link);
  }
}
