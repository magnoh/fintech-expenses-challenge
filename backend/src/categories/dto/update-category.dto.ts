import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'O nome da categoria deve ter no máximo 100 caracteres' })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'A descrição da categoria deve ter no máximo 255 caracteres' })
  description?: string;
}
