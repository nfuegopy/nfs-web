import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username must contain only letters, numbers, underscores and dashes',
  })
  username: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  persona: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;

  // Turnstile not implemented yet, but keeping field as per readme-1
  // @IsString()
  // turnstileToken: string;
}
