import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/api-exception.filter";
import { RequestContextInterceptor } from "./common/request-context.interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const config = app.get(ConfigService);

  app.set("trust proxy", "loopback");
  app.setGlobalPrefix("v1");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(compression());
  app.use(cookieParser());
  app.enableCors({
    origin: config.getOrThrow<string>("WEB_ORIGIN").split(",").map((value) => value.trim()),
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key", "X-CSRF-Token", "X-Request-Id", "X-LevelFit-Step-Up"],
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: false },
  }));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new RequestContextInterceptor());

  if (config.get<boolean>("SWAGGER_ENABLED", config.get("NODE_ENV") !== "production")) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("LevelFit API")
      .setDescription("API REST do MVP LevelFit")
      .setVersion("1.0")
      .addBearerAuth()
      .addCookieAuth("lf_refresh")
      .build();
    SwaggerModule.setup("docs", app, () => SwaggerModule.createDocument(app, swaggerConfig));
  }

  const port = Number(process.env.PORT ?? config.get<number>("API_PORT", 3001));
  await app.listen(port, config.get<string>("API_HOST", "127.0.0.1"));
}

void bootstrap();
