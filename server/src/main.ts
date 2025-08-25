import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import NedbStore from 'connect-nedb-session';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const sessionPath = path.join(process.cwd(), 'private', 'db', 'sessions.coll');
  app.use(
    session({
      secret: '0hM9TmEdgvUDWqOkfTBoC5bvS1o15g5RWeHt2cZqzoespTBX2Z1KKlKXQldurNXY',
      saveUninitialized: true,
      resave: true,
      cookie: { path: '/', httpOnly: true, maxAge: 365 * 24 * 3600 * 1000 },
      store: new NedbStore(session)({ filename: sessionPath, autoload: true }),
    }),
  );
  await app.listen(process.env.PORT ?? 3030);
}
void bootstrap();
