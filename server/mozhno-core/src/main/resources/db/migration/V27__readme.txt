V27 intentionally skipped. No database migration was ever committed
with this version number. Flyway handles the gap (V26 to V28) without
error — it only validates that previously applied migrations have not
been altered.
