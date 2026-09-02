import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Only the name is mutable, so this is written explicitly rather than derived
 * from CreateProfileDto with PartialType: a generic partial DTO would silently
 * expose every column to PATCH.
 */
export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  lastName!: string;
}
