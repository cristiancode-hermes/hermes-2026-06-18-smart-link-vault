import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { LinksService } from './links.service';
import { Link } from './link.entity';
import { Tag } from '../tags/tag.entity';

const createMockLink = () => ({
  id: 1,
  url: 'https://example.com',
  title: 'Example',
  description: 'Test link',
  favicon: null,
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: [],
});

const createMockTag = () => ({
  id: 1,
  name: 'test',
  userId: 1,
  createdAt: new Date(),
});

describe('LinksService', () => {
  let service: LinksService;
  let linkRepo: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let tagRepo: {
    findBy: jest.Mock;
  };

  beforeEach(async () => {
    linkRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    tagRepo = {
      findBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        { provide: getRepositoryToken(Link), useValue: linkRepo },
        { provide: getRepositoryToken(Tag), useValue: tagRepo },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
  });

  describe('create', () => {
    it('creates a link without tags', async () => {
      const mockLink = createMockLink();
      linkRepo.create.mockReturnValue(mockLink);
      linkRepo.save.mockResolvedValue(mockLink);

      const result = await service.create(
        { url: 'https://example.com', title: 'Example' },
        1,
      );

      expect(linkRepo.create).toHaveBeenCalledWith({
        url: 'https://example.com',
        title: 'Example',
        description: null,
        favicon: null,
        userId: 1,
        tags: [],
      });
      expect(result.title).toBe('Example');
    });

    it('creates a link with tags', async () => {
      const tags = [createMockTag(), { ...createMockTag(), id: 2, name: 'dev' }];
      tagRepo.findBy.mockResolvedValue(tags);

      const mockLink = { ...createMockLink(), tags };
      linkRepo.create.mockReturnValue(mockLink);
      linkRepo.save.mockResolvedValue(mockLink);

      const result = await service.create(
        { url: 'https://example.com', title: 'Example', tagIds: [1, 2] },
        1,
      );

      expect(tagRepo.findBy).toHaveBeenCalled();
      expect(result.tags).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('returns a link if found', async () => {
      linkRepo.findOne.mockResolvedValue(createMockLink());

      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('throws NotFoundException if not found', async () => {
      linkRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates a link owned by the user', async () => {
      const mockLink = createMockLink();
      linkRepo.findOne.mockResolvedValue(mockLink);
      linkRepo.save.mockResolvedValue({ ...mockLink, title: 'Updated' });

      const result = await service.update(1, { title: 'Updated' }, 1);
      expect(result.title).toBe('Updated');
    });

    it('throws ForbiddenException if not owned by user', async () => {
      const mockLink = createMockLink();
      linkRepo.findOne.mockResolvedValue(mockLink);

      await expect(service.update(1, { title: 'x' }, 2)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('removes a link owned by the user', async () => {
      linkRepo.findOne.mockResolvedValue(createMockLink());
      linkRepo.remove.mockResolvedValue(undefined);

      await expect(service.remove(1, 1)).resolves.toBeUndefined();
    });

    it('throws ForbiddenException if not owned by user', async () => {
      linkRepo.findOne.mockResolvedValue(createMockLink());

      await expect(service.remove(1, 2)).rejects.toThrow(ForbiddenException);
    });
  });
});
