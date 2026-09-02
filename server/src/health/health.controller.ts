import { Controller, Get } from '@nestjs/common';

/**
 * Deployment health check. Deliberately outside the /api prefix and outside
 * the profiles domain: it is infrastructure, not business functionality.
 */
@Controller('health')
export class HealthController {
  @Get()
  check(): { status: string } {
    return { status: 'ok' };
  }
}
