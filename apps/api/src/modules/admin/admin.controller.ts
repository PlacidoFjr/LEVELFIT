import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import type { AuthUser } from "../../common/auth-user";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminService } from "./admin.service";
import { OwnerGuard } from "./owner.guard";

@Controller("admin")
@UseGuards(JwtAuthGuard, OwnerGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("overview")
  overview() {
    return this.admin.overview();
  }

  @Get("products")
  products() {
    return this.admin.products();
  }

  @Get("users")
  users() {
    return this.admin.users();
  }

  @Get("professionals")
  professionals() {
    return this.admin.professionals();
  }

  @Get("roles")
  roles() {
    return this.admin.roles();
  }

  @Post("roles")
  grantRole(@Req() request: Request & { user: AuthUser }, @Body() body: { email?: string; role?: "OWNER" | "NUTRITIONIST" | "RUN_COACH" }) {
    return this.admin.grantRole(request.user.userId, body.email ?? "", body.role ?? "NUTRITIONIST");
  }

  @Delete("roles/:id")
  revokeRole(@Req() request: Request & { user: AuthUser }, @Param("id") id: string) {
    return this.admin.revokeRole(request.user.userId, id);
  }

  @Get("settings")
  settings() {
    return this.admin.settings();
  }

  @Get("security-events")
  securityEvents() {
    return this.admin.securityEvents();
  }
}
