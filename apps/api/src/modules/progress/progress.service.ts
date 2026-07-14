import { BadRequestException, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateBodyMeasurementDto, CreateProgressPhotoDto } from "./progress.dto";

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertConsent(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { sensitiveDataConsentAt: true } });
    if (!user.sensitiveDataConsentAt) throw new BadRequestException({ code: "CONSENT_REQUIRED", message: "Consentimento para dados sensiveis e obrigatorio." });
  }

  async measurements(userId: string) {
    await this.assertConsent(userId);
    const data = await this.prisma.bodyMeasurement.findMany({ where: { userId, deletedAt: null }, orderBy: { measuredAt: "desc" }, take: 100 });
    return { data, page: { nextCursor: null, hasMore: false } };
  }

  async createMeasurement(userId: string, dto: CreateBodyMeasurementDto) {
    await this.assertConsent(userId);
    const values = [dto.weightKg, dto.waistCm, dto.hipCm, dto.chestCm, dto.armCm, dto.thighCm];
    if (!values.some((value) => value !== undefined)) throw new BadRequestException({ code: "MEASUREMENT_REQUIRED", message: "Informe ao menos uma medida." });
    return this.prisma.bodyMeasurement.create({ data: { userId, ...dto, measuredAt: dto.measuredAt ? new Date(dto.measuredAt) : new Date() } });
  }

  async createPhoto(userId: string, dto: CreateProgressPhotoDto) {
    await this.assertConsent(userId);
    if (!(["image/jpeg", "image/png", "image/webp"].includes(dto.contentType))) throw new BadRequestException({ code: "UNSUPPORTED_MEDIA_TYPE", message: "Formato de imagem nao suportado." });
    const photoId = randomUUID();
    const storageKey = `progress/${userId}/${photoId}`;
    const photo = await this.prisma.progressPhoto.create({ data: { id: photoId, userId, storageKey, contentType: dto.contentType, sizeBytes: dto.sizeBytes, pose: dto.pose, takenAt: dto.takenAt ? new Date(dto.takenAt) : new Date() } });
    return { photo, upload: { required: true, url: null, note: "Configure S3/R2 para emitir URL assinada." } };
  }
}
