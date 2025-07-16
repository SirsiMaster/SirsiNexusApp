-- Make the name column NOT NULL after backfill is complete
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
