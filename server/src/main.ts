import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Allowed browser origins come from FRONTEND_URL as a comma separated list so
 * that local development and the deployed frontend can both be permitted
 * without hardcoding a production URL in the source.
 *
 * A trailing slash is stripped because an `Origin` header never carries one:
 * pasting a deployment URL in verbatim would otherwise silently allow nothing.
 */
function parseAllowedOrigins(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', { exclude: ['health'] });

  const allowedOrigins = parseAllowedOrigins(process.env.FRONTEND_URL);
  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
}

void bootstrap();
