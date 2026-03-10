import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    // 限流模块：每60秒最多30次请求
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 30,
    }]),
    UsersModule,
    HealthModule,
    AuthModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局限流守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
