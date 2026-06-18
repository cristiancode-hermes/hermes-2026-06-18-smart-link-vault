import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { QueryLinkDto } from './dto/query-link.dto';
import type { Request } from 'express';

@ApiTags('Links')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new link' })
  async create(@Body() dto: CreateLinkDto, @Req() req: Request) {
    const user = req.user as { id: number };
    return this.linksService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all links for the authenticated user' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tagId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: QueryLinkDto, @Req() req: Request) {
    const user = req.user as { id: number };
    return this.linksService.findAllByUser(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a link by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.linksService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a link' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLinkDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number };
    return this.linksService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a link' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as { id: number };
    await this.linksService.remove(id, user.id);
    return { message: 'Link deleted successfully' };
  }
}
