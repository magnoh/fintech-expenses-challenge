import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@GetUser() user: Omit<User, 'password'>, @Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(user.id, createTransactionDto);
  }

  @Get()
  findAll(@GetUser() user: Omit<User, 'password'>, @Query() query: GetTransactionsDto) {
    return this.transactionsService.findAll(user.id, query);
  }

  @Get(':id')
  findOne(@GetUser() user: Omit<User, 'password'>, @Param('id') id: string) {
    return this.transactionsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @GetUser() user: Omit<User, 'password'>,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, user.id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@GetUser() user: Omit<User, 'password'>, @Param('id') id: string) {
    return this.transactionsService.remove(id, user.id);
  }
}
