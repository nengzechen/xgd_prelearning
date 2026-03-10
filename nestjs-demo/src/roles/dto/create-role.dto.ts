import {
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: '角色名称必须是字符串' })
  @MinLength(2, { message: '角色名称至少2个字符' })
  @MaxLength(30, { message: '角色名称最多30个字符' })
  name: string;

  @IsOptional()
  @IsString({ message: '角色描述必须是字符串' })
  @MaxLength(200, { message: '角色描述最多200个字符' })
  description?: string;

  @IsArray({ message: '权限列表必须是数组' })
  @ArrayMinSize(1, { message: '至少需要一个权限' })
  @IsString({ each: true, message: '每个权限必须是字符串' })
  permissions: string[];
}
