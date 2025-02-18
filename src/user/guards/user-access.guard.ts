import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class UserAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const targetUserId = parseInt(request.params.id, 10);

    if (!user) {
      throw new ForbiddenException('用户未登录');
    }

    // 管理员可以访问所有用户信息
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // 普通用户只能访问自己的信息
    if (user.id === targetUserId) {
      return true;
    }

    throw new ForbiddenException('没有权限访问其他用户的信息');
  }
}
