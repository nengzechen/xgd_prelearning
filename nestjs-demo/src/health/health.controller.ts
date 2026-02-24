import { Controller, Get } from '@nestjs/common';

/**
 * 健康检查 Controller
 * 演示不同类型的 GET 接口
 */
@Controller('health')
export class HealthController {
  private readonly startTime = new Date();

  /**
   * GET /api/health
   * 基础健康检查
   */
  @Get()
  check() {
    return {
      status: 'ok',
      uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      environment: process.env.NODE_ENV ?? 'development',
    };
  }

  /**
   * GET /api/health/info
   * 应用信息
   */
  @Get('info')
  info() {
    return {
      name: 'nestjs-demo',
      version: '1.0.0',
      description: 'NestJS 第八周实践项目',
      author: '陈能泽',
      framework: 'NestJS',
      runtime: `Node.js ${process.version}`,
      startedAt: this.startTime.toISOString(),
    };
  }
}
