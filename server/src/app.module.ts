import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, ProfilesModule],
  controllers: [HealthController],
})
export class AppModule {}
