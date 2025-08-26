import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import NedbStore from 'nedb-session-store';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const sessionPath = path.join(process.cwd(), 'private', 'db', 'sessions.coll');
  const sessionStore = new NedbStore(session)({ filename: sessionPath, autoload: true });
  app.use(
    session({
      secret: '0hM9TmEdgvUDWqOkfTBoC5bvS1o15g5RWeHt2cZqzoespTBX2Z1KKlKXQldurNXY',
      saveUninitialized: false,
      resave: true,
      cookie: { path: '/', httpOnly: true, maxAge: 365 * 24 * 3600 * 1000 },
      store: sessionStore,
    }),
  );
  await app.listen(process.env.PORT ?? 3030);
}
void bootstrap();
