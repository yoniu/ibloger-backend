import { IsString, MinLength, IsOptional, IsEmail } from 'class-validator';

export class LoginUserDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(6)
  password: string;
}
