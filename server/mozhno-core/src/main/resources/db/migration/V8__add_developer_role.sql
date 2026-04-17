ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'editor', 'developer', 'viewer'));

UPDATE users SET role = 'developer' WHERE role = 'editor';