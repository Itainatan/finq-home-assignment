import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { ProfilesController } from '../src/profiles/profiles.controller';
import { ProfilesService } from '../src/profiles/profiles.service';

/**
 * Critical path: save a random profile, list it, rename it, delete it, plus the
 * two failure modes the UI actually reacts to (409 duplicate, 404 missing).
 *
 * Prisma is mocked rather than pointed at a real database so the suite runs in
 * CI with no infrastructure. The tradeoff is documented in DECISIONS.md: this
 * proves the HTTP contract and the error mapping, not the SQL.
 */

const savedProfile = {
  id: 'ckprofile1',
  externalId: 'a2f0d1c4-0000-4000-8000-000000000001',
  title: 'Mr',
  firstName: 'John',
  lastName: 'Smith',
  gender: 'male',
  email: 'john.smith@example.com',
  phone: '011-962-7516',
  dateOfBirth: new Date('1985-04-12T00:00:00.000Z'),
  country: 'United States',
  state: 'Michigan',
  city: 'Billings',
  streetName: 'Valwood Pkwy',
  streetNumber: '8929',
  pictureUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
  thumbnailUrl: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const createPayload = {
  externalId: savedProfile.externalId,
  title: savedProfile.title,
  firstName: savedProfile.firstName,
  lastName: savedProfile.lastName,
  gender: savedProfile.gender,
  email: savedProfile.email,
  phone: savedProfile.phone,
  dateOfBirth: '1985-04-12T00:00:00.000Z',
  country: savedProfile.country,
  state: savedProfile.state,
  city: savedProfile.city,
  streetName: savedProfile.streetName,
  streetNumber: savedProfile.streetNumber,
  pictureUrl: savedProfile.pictureUrl,
  thumbnailUrl: savedProfile.thumbnailUrl,
};

const prismaMock = {
  profile: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

function knownRequestError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('mocked', {
    code,
    clientVersion: 'test',
  });
}

describe('Profiles API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [ProfilesService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['health'] });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns 200 and an empty array when nothing is saved', async () => {
    prismaMock.profile.findMany.mockResolvedValue([]);

    const response = await request(app.getHttpServer()).get('/api/profiles').expect(200);

    expect(response.body).toEqual([]);
  });

  it('saves a profile and returns 201 with the database identity', async () => {
    prismaMock.profile.create.mockResolvedValue(savedProfile);

    const response = await request(app.getHttpServer())
      .post('/api/profiles')
      .send(createPayload)
      .expect(201);

    expect(response.body.id).toBe(savedProfile.id);
    expect(response.body.firstName).toBe('John');
    expect(prismaMock.profile.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        externalId: createPayload.externalId,
        dateOfBirth: new Date(createPayload.dateOfBirth),
      }),
    });
  });

  it('persists the edited name rather than the original provider value', async () => {
    prismaMock.profile.create.mockResolvedValue({ ...savedProfile, firstName: 'Johnny' });

    await request(app.getHttpServer())
      .post('/api/profiles')
      .send({ ...createPayload, firstName: 'Johnny' })
      .expect(201);

    expect(prismaMock.profile.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ firstName: 'Johnny' }),
    });
  });

  it('maps a unique constraint violation to 409', async () => {
    prismaMock.profile.create.mockRejectedValue(knownRequestError('P2002'));

    const response = await request(app.getHttpServer())
      .post('/api/profiles')
      .send(createPayload)
      .expect(409);

    expect(response.body.message).toBe('Profile already saved');
  });

  it('rejects an invalid payload with 400', async () => {
    await request(app.getHttpServer())
      .post('/api/profiles')
      .send({ ...createPayload, email: 'not-an-email' })
      .expect(400);

    expect(prismaMock.profile.create).not.toHaveBeenCalled();
  });

  it('rejects a payload that tries to write a non-editable column', async () => {
    await request(app.getHttpServer())
      .post('/api/profiles')
      .send({ ...createPayload, id: 'client-chosen-id' })
      .expect(400);
  });

  it('updates only the name and returns 200', async () => {
    prismaMock.profile.update.mockResolvedValue({ ...savedProfile, firstName: 'Johnny' });

    const response = await request(app.getHttpServer())
      .patch(`/api/profiles/${savedProfile.id}`)
      .send({ firstName: 'Johnny', lastName: 'Smith' })
      .expect(200);

    expect(response.body.firstName).toBe('Johnny');
    expect(prismaMock.profile.update).toHaveBeenCalledWith({
      where: { id: savedProfile.id },
      data: { firstName: 'Johnny', lastName: 'Smith' },
    });
  });

  it('rejects non-name fields sent to PATCH', async () => {
    prismaMock.profile.update.mockResolvedValue(savedProfile);

    await request(app.getHttpServer())
      .patch(`/api/profiles/${savedProfile.id}`)
      .send({ firstName: 'John', lastName: 'Smith', email: 'attacker@example.com' })
      .expect(400);
  });

  it('maps a missing record to 404 on update', async () => {
    prismaMock.profile.update.mockRejectedValue(knownRequestError('P2025'));

    await request(app.getHttpServer())
      .patch('/api/profiles/does-not-exist')
      .send({ firstName: 'John', lastName: 'Smith' })
      .expect(404);
  });

  it('deletes a profile and returns 204 with no body', async () => {
    prismaMock.profile.delete.mockResolvedValue(savedProfile);

    const response = await request(app.getHttpServer())
      .delete(`/api/profiles/${savedProfile.id}`)
      .expect(204);

    expect(response.body).toEqual({});
  });

  it('maps a missing record to 404 on delete', async () => {
    prismaMock.profile.delete.mockRejectedValue(knownRequestError('P2025'));

    await request(app.getHttpServer()).delete('/api/profiles/does-not-exist').expect(404);
  });
});
