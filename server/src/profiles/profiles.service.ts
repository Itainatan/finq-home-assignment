import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Profile } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';
const RECORD_NOT_FOUND = 'P2025';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Profile[]> {
    return this.prisma.profile.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreateProfileDto): Promise<Profile> {
    try {
      return await this.prisma.profile.create({
        data: {
          ...dto,
          title: dto.title ?? '',
          dateOfBirth: new Date(dto.dateOfBirth),
        },
      });
    } catch (error) {
      // The database UNIQUE constraint is the real guard here, not a prior
      // lookup: two concurrent requests would both pass a findFirst check.
      if (isPrismaError(error, UNIQUE_CONSTRAINT_VIOLATION)) {
        throw new ConflictException('Profile already saved');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateProfileDto): Promise<Profile> {
    try {
      return await this.prisma.profile.update({
        where: { id },
        data: { firstName: dto.firstName, lastName: dto.lastName },
      });
    } catch (error) {
      if (isPrismaError(error, RECORD_NOT_FOUND)) {
        throw new NotFoundException('Profile no longer exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.profile.delete({ where: { id } });
    } catch (error) {
      if (isPrismaError(error, RECORD_NOT_FOUND)) {
        throw new NotFoundException('Profile no longer exists');
      }
      throw error;
    }
  }
}

function isPrismaError(error: unknown, code: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}
