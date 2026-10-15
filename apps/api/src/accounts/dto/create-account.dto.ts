import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateAccountDto {
  @Transform(trim)
  @IsString()
  @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El usuario puede tener hasta 20 caracteres' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'El usuario sólo puede tener letras, números, guiones y guiones bajos' })
  username: string;

  @Transform(trim)
  @IsString()
  @MinLength(3, { message: 'El nombre de piloto debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El nombre de piloto puede tener hasta 20 caracteres' })
  @Matches(/^[\p{L}\p{N}_][\p{L}\p{N}_ .-]*[\p{L}\p{N}_]$/u, {
    message: 'El nombre de piloto sólo puede tener letras, números, espacios, puntos o guiones',
  })
  persona: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Ingresá un email válido' })
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(64, { message: 'La contraseña puede tener hasta 64 caracteres' })
  @Matches(/^[^\x00-\x1f\x7f]*$/, { message: 'La contraseña tiene caracteres no permitidos' })
  password: string;
}
