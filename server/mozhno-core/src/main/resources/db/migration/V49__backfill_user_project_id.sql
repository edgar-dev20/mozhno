DO $$
DECLARE
    default_project_id INTEGER;
BEGIN
    SELECT id INTO default_project_id FROM projects ORDER BY id LIMIT 1;

    IF default_project_id IS NULL THEN
        INSERT INTO projects (name, description) VALUES ('My Project', 'Auto-created during migration')
        RETURNING id INTO default_project_id;

        INSERT INTO environments (name, description, project_id, created_at)
        VALUES
            ('Production', 'Live environment', default_project_id, NOW()),
            ('Staging', 'Pre-production testing', default_project_id, NOW()),
            ('Development', 'Local and shared development', default_project_id, NOW());
    END IF;

    UPDATE users SET project_id = default_project_id WHERE project_id IS NULL;
END $$;
