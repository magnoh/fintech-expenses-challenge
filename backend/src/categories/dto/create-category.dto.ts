import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório' })
  @MaxLength(100, { message: 'O nome da categoria deve ter no máximo 100 caracteres' })
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'A descrição da categoria deve ter no máximo 255 caracteres' })
  description?: string;
}
