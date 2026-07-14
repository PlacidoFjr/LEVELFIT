import { Body, Controller, Delete, Get, Headers, Param, ParseBoolPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SubscribePushDto, TestEmailPreferencesDto, UnsubscribePushDto, UpdateNotificationPreferencesDto } from "./notifications.dto";
import { NotificationsService } from "./notifications.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get("notifications")
  list(@CurrentUser() user: AuthUser, @Query("unread", new ParseBoolPipe({ optional: true })) unread?: boolean) {
    return this.notifications.list(user.userId, unread);
  }

  @Patch("notifications/read-all")
  readAll(@CurrentUser() user: AuthUser) { return this.notifications.markAllRead(user.userId); }

  @Patch("notifications/:id/read")
  read(@CurrentUser() user: AuthUser, @Param("id") id: string) { return this.notifications.markRead(user.userId, id); }

  @Get("notification-preferences")
  preferences(@CurrentUser() user: AuthUser) { return this.notifications.getPreferences(user.userId); }

  @Patch("notification-preferences")
  updatePreferences(@CurrentUser() user: AuthUser, @Body() dto: UpdateNotificationPreferencesDto) {
    return this.notifications.updatePreferences(user.userId, dto);
  }

  @Post("push/subscribe")
  subscribe(@CurrentUser() user: AuthUser, @Body() dto: SubscribePushDto, @Headers("user-agent") userAgent?: string) {
    return this.notifications.subscribe(user.userId, dto, userAgent);
  }

  @Delete("push/unsubscribe")
  unsubscribe(@CurrentUser() user: AuthUser, @Body() dto: UnsubscribePushDto) {
    return this.notifications.unsubscribe(user.userId, dto);
  }

  @Post("emails/test-preferences")
  testEmail(@CurrentUser() user: AuthUser, @Body() dto: TestEmailPreferencesDto) {
    return this.notifications.queueTestEmail(user.userId, dto);
  }
}
