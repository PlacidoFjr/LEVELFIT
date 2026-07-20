UPDATE professional_invites
SET
  is_active = false,
  deleted_at = COALESCE(deleted_at, NOW()),
  updated_at = NOW()
WHERE code IN ('LF-NUTRI-382', 'LF-TAF-284');
