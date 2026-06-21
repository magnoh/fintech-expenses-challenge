import { IsEnum, IsISO8601, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'A descrição deve ter no máximo 255 caracteres' })
  description?: string;

  @IsNumber({}, { message: 'O valor deve ser um número' })
  @IsPositive({ message: 'O valor deve ser maior que zero' })
  @IsOptional()
  amount?: number;

  @IsEnum(TransactionType, { message: 'O tipo deve ser "income" (entrada) ou "expense" (saída)' })
  @IsOptional()
  type?: TransactionType;

  @IsISO8601({}, { message: 'A data deve estar no formato ISO8601' })
  @IsOptional()
  date?: string;

  @IsUUID('4', { message: 'Categoria inválida' })
  @IsOptional()
  categoryId?: string;
}
