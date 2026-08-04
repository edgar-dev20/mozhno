-- Backfill any orphaned users with a fallback project.
-- The application guarantees every new user gets a project_id at creation time;
-- project deletion is no longer allowed, so NULLs can never reappear.
DO $$
DECLARE
    fallback_project_id INTEGER;
BEGIN
    SELECT id INTO fallback_project_id FROM projects ORDER BY id LIMIT 1;
    IF fallback_project_id IS NULL THEN
        INSERT INTO projects (name) VALUES ('My Project') RETURNING id INTO fallback_project_id;
    END IF;
    UPDATE users SET project_id = fallback_project_id WHERE project_id IS NULL;
END $$;
