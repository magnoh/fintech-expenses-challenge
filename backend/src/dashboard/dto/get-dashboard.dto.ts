import { IsISO8601, IsOptional } from 'class-validator';

export class GetDashboardDto {
  @IsOptional()
  @IsISO8601({}, { message: 'A data inicial deve estar no formato ISO8601' })
  startDate?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'A data final deve estar no formato ISO8601' })
  endDate?: string;
}
