import {
  IsEmail,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

/**
 * The write contract for persisting a profile.
 *
 * It mirrors our own Profile model, not the RandomUser response shape: the
 * client normalizes at the provider boundary and sends us our own fields.
 */
export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  externalId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  title?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  gender!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  phone!: string;

  @IsISO8601()
  dateOfBirth!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  country!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  streetName?: string;

  /** Kept as a string: it is an address fragment, never arithmetic. */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  streetNumber?: string;

  @IsUrl()
  pictureUrl!: string;

  @IsUrl()
  thumbnailUrl!: string;
}
