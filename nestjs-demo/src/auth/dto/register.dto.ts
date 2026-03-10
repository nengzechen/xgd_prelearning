import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../../users/dto/create-user.dto';

export class RegisterDto {
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(2, { message: '用户名至少2个字符' })
  @MaxLength(50, { message: '用户名最多50个字符' })
  name: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: '角色必须是 admin/user/viewer 之一' })
  role?: UserRole;
}
