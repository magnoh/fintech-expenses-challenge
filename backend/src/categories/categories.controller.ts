import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@GetUser() user: Omit<User, 'password'>, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(user.id, createCategoryDto);
  }

  @Get()
  findAll(@GetUser() user: Omit<User, 'password'>) {
    return this.categoriesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@GetUser() user: Omit<User, 'password'>, @Param('id') id: string) {
    return this.categoriesService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @GetUser() user: Omit<User, 'password'>,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, user.id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@GetUser() user: Omit<User, 'password'>, @Param('id') id: string) {
    return this.categoriesService.remove(id, user.id);
  }
}
