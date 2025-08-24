import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: '0hM9TmEdgvUDWqOkfTBoC5bvS1o15g5RWeHt2cZqzoespTBX2Z1KKlKXQldurNXY',
      saveUninitialized: true,
      resave: false,
    }),
  );
  await app.listen(process.env.PORT ?? 3030);
}
void bootstrap();
