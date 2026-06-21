import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { GetDashboardDto } from './dto/get-dashboard.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboardData(
    @GetUser() user: Omit<User, 'password'>,
    @Query() query: GetDashboardDto,
  ) {
    return this.dashboardService.getDashboardData(user.id, query);
  }
}
