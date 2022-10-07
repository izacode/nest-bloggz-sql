import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './exception.filter';

const PORT = process.env.PORT || 5000;

// export const createApp = (app) => {
//   app.enableCors();
//   app.use(cookieParser());
//   app.useGlobalPipes(
//     new ValidationPipe({
//       // stopAtFirstError: true,
//       // Here we configure what globalPipes will send to GlobalFilters(errors)
//       exceptionFactory: (errors) => {
//         const errorsForResponse = [];
//         errors.forEach((e) => {
//           const constraintsKeys = Object.keys(e.constraints);
//           constraintsKeys.forEach((ckey) => {
//             errorsForResponse.push({
//               message: e.constraints[ckey],
//               field: e.property,
//             });
//           });
//         });
//         throw new BadRequestException(errorsForResponse);
//       },
//     }),
//   );
//   app.useGlobalFilters(new HttpExceptionFilter());
//   return app
// }

async function bootstrap() {
  let app = await NestFactory.create(AppModule);
  // app = createApp(app)
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      // stopAtFirstError: true,
      // Here we configure what globalPipes will send to GlobalFilters(errors)
      exceptionFactory: (errors) => {
        const errorsForResponse = [];
        errors.forEach((e) => {
          const constraintsKeys = Object.keys(e.constraints);
          constraintsKeys.forEach((ckey) => {
            errorsForResponse.push({
              message: e.constraints[ckey],
              field: e.property,
            });
          });
        });
        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(PORT);
}
bootstrap();
