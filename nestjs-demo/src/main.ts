import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 全局路由前缀
  app.setGlobalPrefix('api');

  // 全局验证管道（自动校验 DTO）
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // 过滤掉 DTO 中未声明的属性
      forbidNonWhitelisted: true, // 存在非白名单字段时抛出异常
      transform: true,          // 自动将 plain object 转为 DTO 类实例
    }),
  );

  // 全局异常过滤器（AllExceptionsFilter 在前，HttpExceptionFilter 在后）
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
  );

  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // 跨域支持
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
