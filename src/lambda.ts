import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { Handler, Context } from 'aws-lambda';
import { AppModule } from './app.module';

let cachedServer: any;

export const handler: Handler = async (event: any, context: Context) => {
  if (!cachedServer) {
    const nestApp = await NestFactory.create(AppModule);
    await nestApp.init();
    cachedServer = serverlessExpress({
      app: nestApp.getHttpAdapter().getInstance(),
    });

    return cachedServer(event, context);
  }
};
