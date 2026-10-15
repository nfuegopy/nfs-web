import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
// Sin caracteres de control: evita saltos de línea o bytes nulos en contraseñas.
const NO_CONTROL = /^[^\x00-\x1f\x7f]*$/;

export class LoginDto {
  @Transform(trim)
  @IsString()
  @Matches(/^[A-Za-z0-9_.@+-]{1,64}$/, { message: 'Usuario o contraseña incorrectos' })
  username: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;
}

export class NewPasswordField {
  @IsString()
  @MinLength(8, { message: 'La contraseña nueva debe tener al menos 8 caracteres' })
  @MaxLength(64, { message: 'La contraseña nueva puede tener hasta 64 caracteres' })
  @Matches(NO_CONTROL, { message: 'La contraseña tiene caracteres no permitidos' })
  newPassword: string;
}

export class ChangePasswordDto extends NewPasswordField {
  @IsString()
  @MinLength(1, { message: 'Ingresá tu contraseña actual' })
  @MaxLength(128)
  currentPassword: string;
}

export class ForgotPasswordDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Ingresá un email válido' })
  @MaxLength(254)
  email: string;
}

export class ResetPasswordDto extends NewPasswordField {
  @IsString()
  @MaxLength(2048)
  token: string;
}
