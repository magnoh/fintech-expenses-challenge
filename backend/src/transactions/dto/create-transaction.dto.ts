import { IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @MaxLength(255, { message: 'A descrição deve ter no máximo 255 caracteres' })
  description!: string;

  @IsNumber({}, { message: 'O valor deve ser um número' })
  @IsPositive({ message: 'O valor deve ser maior que zero' })
  amount!: number;

  @IsEnum(TransactionType, { message: 'O tipo deve ser "income" (entrada) ou "expense" (saída)' })
  type!: TransactionType;

  @IsISO8601({}, { message: 'A data deve estar no formato ISO8601' })
  date!: string;

  @IsUUID('4', { message: 'Categoria inválida' })
  @IsNotEmpty({ message: 'A categoria é obrigatória' })
  categoryId!: string;
}
