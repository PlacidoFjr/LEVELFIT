import { Body, Controller, Delete, Get, HttpCode, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { DeleteAccountDto, ExportDataDto, UpdateMeDto } from "./users.dto";
import { UsersService } from "./users.service";

@Controller("me")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get() me(@CurrentUser() user: AuthUser) { return this.users.me(user.userId); }
  @Patch() update(@CurrentUser() user: AuthUser, @Body() dto: UpdateMeDto) { return this.users.update(user.userId, dto); }
  @Get("security-events") securityEvents(@CurrentUser() user: AuthUser) { return this.users.securityEvents(user.userId); }
  @Post("export-data") @HttpCode(202) exportData(@CurrentUser() user: AuthUser, @Body() dto: ExportDataDto) { return this.users.requestExport(user.userId, dto); }
  @Delete() @HttpCode(202) delete(@CurrentUser() user: AuthUser, @Body() dto: DeleteAccountDto) { return this.users.deleteAccount(user, dto); }
}
