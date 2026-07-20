import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import type { AuthUser } from "../../common/auth-user";
import { CurrentUser } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AcceptProfessionalInviteDto, ProfessionalRecipientsQueryDto, SendProfessionalMessageDto, UpdateProfessionalPermissionsDto } from "./professionals.dto";
import { ProfessionalsService } from "./professionals.service";

@Controller("professional-connections")
@UseGuards(JwtAuthGuard)
export class ProfessionalsController {
  constructor(private readonly professionals: ProfessionalsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.professionals.list(user.userId);
  }

  @Get("invite")
  previewInvite(@CurrentUser() user: AuthUser, @Query("code") code = "") {
    return this.professionals.previewInvite(user.userId, code);
  }

  @Post("accept")
  accept(@CurrentUser() user: AuthUser, @Body() dto: AcceptProfessionalInviteDto) {
    return this.professionals.accept(user.userId, dto);
  }

  @Patch(":id/permissions")
  updatePermissions(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateProfessionalPermissionsDto) {
    return this.professionals.updatePermissions(user.userId, id, dto);
  }

  @Delete(":id")
  revoke(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.professionals.revoke(user.userId, id);
  }

  @Get("pro/recipients")
  recipients(@CurrentUser() user: AuthUser, @Query() query: ProfessionalRecipientsQueryDto) {
    return this.professionals.recipients(user, query.kind);
  }

  @Post("pro/messages")
  sendMessage(@CurrentUser() user: AuthUser, @Body() dto: SendProfessionalMessageDto) {
    return this.professionals.sendMessage(user, dto);
  }
}
