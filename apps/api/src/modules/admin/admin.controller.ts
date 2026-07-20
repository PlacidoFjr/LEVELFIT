import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import type { AuthUser } from "../../common/auth-user";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateProfessionalInviteDto, GrantRoleDto } from "./admin.dto";
import { AdminService } from "./admin.service";
import { OwnerGuard } from "./owner.guard";
import { OwnerStepUpGuard } from "./owner-step-up.guard";

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

  @Get("professional-invites")
  professionalInvites() {
    return this.admin.professionalInvites();
  }

  @Post("professional-invites")
  @UseGuards(OwnerStepUpGuard)
  createProfessionalInvite(@Req() request: Request & { user: AuthUser }, @Body() body: CreateProfessionalInviteDto) {
    return this.admin.createProfessionalInvite(request.user.userId, body);
  }

  @Delete("professional-invites/:id")
  @UseGuards(OwnerStepUpGuard)
  revokeProfessionalInvite(@Req() request: Request & { user: AuthUser }, @Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.admin.revokeProfessionalInvite(request.user.userId, id);
  }

  @Get("roles")
  roles() {
    return this.admin.roles();
  }

  @Post("roles")
  @UseGuards(OwnerStepUpGuard)
  grantRole(@Req() request: Request & { user: AuthUser }, @Body() body: GrantRoleDto) {
    return this.admin.grantRole(request.user.userId, body.email, body.role);
  }

  @Delete("roles/:id")
  @UseGuards(OwnerStepUpGuard)
  revokeRole(@Req() request: Request & { user: AuthUser }, @Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
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
