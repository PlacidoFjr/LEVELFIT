import { Injectable, Logger, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: App | null = null;

  constructor(private readonly config: ConfigService) {}

  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    try {
      return await getAuth(this.getApp()).verifyIdToken(idToken);
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "unknown";
      const message = error instanceof Error ? error.message : "unknown";
      this.logger.warn(`Firebase token verification failed: ${code} - ${message}`);
      throw new UnauthorizedException({ code: "INVALID_FIREBASE_TOKEN", message: "Sessao Firebase invalida ou expirada." });
    }
  }

  private getApp() {
    if (this.app) return this.app;
    const existing = getApps()[0];
    if (existing) {
      this.app = existing;
      return existing;
    }

    const projectId = this.config.get<string>("FIREBASE_PROJECT_ID");
    const clientEmail = this.config.get<string>("FIREBASE_CLIENT_EMAIL");
    const privateKey = this.config.get<string>("FIREBASE_PRIVATE_KEY")?.trim().replace(/^"|"$/g, "").replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new ServiceUnavailableException({ code: "FIREBASE_ADMIN_NOT_CONFIGURED", message: "Firebase Admin ainda nao foi configurado." });
    }

    this.app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    return this.app;
  }
}
