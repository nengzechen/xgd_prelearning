import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

interface EchoDto {
  message: string;
}

/**
 * 根路由 Controller
 * 演示基础 GET / POST 接口
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * GET /api
   * 欢迎信息
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * POST /api/echo
   * 回显接口（演示 POST + Body 接收）
   */
  @Post('echo')
  echo(@Body() body: EchoDto): { echo: string; receivedAt: string } {
    return {
      echo: body.message,
      receivedAt: new Date().toISOString(),
    };
  }
}
