import { IsEnum, IsInt, IsOptional, IsUUID, Min, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../entities/transaction.entity';

export class GetTransactionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsEnum(TransactionType, { message: 'Tipo inválido' })
  type?: TransactionType;

  @IsOptional()
  @IsUUID('4', { message: 'ID da categoria deve ser um UUID válido' })
  categoryId?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'A data inicial deve estar no formato ISO8601' })
  startDate?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'A data final deve estar no formato ISO8601' })
  endDate?: string;
}
