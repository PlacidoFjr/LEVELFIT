const saoPauloOffsetMs = 3 * 60 * 60 * 1000;
const dailyResetHour = 4;
const dailyResetMinute = 30;

function appLocalDateParts(date = new Date()) {
  const local = new Date(date.getTime() - saoPauloOffsetMs);
  if (local.getUTCHours() < dailyResetHour || (local.getUTCHours() === dailyResetHour && local.getUTCMinutes() < dailyResetMinute)) {
    local.setUTCDate(local.getUTCDate() - 1);
  }
  return { year: local.getUTCFullYear(), month: local.getUTCMonth(), day: local.getUTCDate() };
}

export function asUtcDate(date = new Date()) {
  const { year, month, day } = appLocalDateParts(date);
  return new Date(Date.UTC(year, month, day));
}

export function utcDayRange(date = new Date()) {
  const businessDate = asUtcDate(date);
  const start = new Date(Date.UTC(businessDate.getUTCFullYear(), businessDate.getUTCMonth(), businessDate.getUTCDate(), dailyResetHour + 3, dailyResetMinute));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}
