-- Recreate the FK with ON DELETE SET NULL so child users survive when their creator is deleted.
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'users_created_by_fkey' AND table_name = 'users') THEN
        ALTER TABLE users DROP CONSTRAINT users_created_by_fkey;
    END IF;
END $$;
ALTER TABLE users ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
