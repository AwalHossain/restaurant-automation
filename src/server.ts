import { Server } from 'http';
import app from './app';
import env from './config';
import { errorlogger, logger } from './shared/logger';


async function bootstrap() {

  const server: Server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });

  const exitHandler = () => {

    if (server) {
      server.close(() => {
        logger.info('Server closed');
      });
    }
    process.exit(1);
  };

  const unexpectedErrorHandler = (error: unknown) => {
    errorlogger.error(error);
    exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
      server.close();
    }
  });
}

bootstrap();