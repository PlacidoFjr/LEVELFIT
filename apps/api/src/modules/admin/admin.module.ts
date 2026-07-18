import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { OwnerGuard } from "./owner.guard";

@Module({ imports: [AuthModule], controllers: [AdminController], providers: [AdminService, OwnerGuard] })
export class AdminModule {}
