import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateUserProfileDto {
  @IsString()
  @IsOptional()
  nickname?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class UpdateUserProfileDto extends CreateUserProfileDto {}
