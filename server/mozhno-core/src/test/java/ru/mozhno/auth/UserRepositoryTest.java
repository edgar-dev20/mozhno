package ru.mozhno.auth;

import org.junit.jupiter.api.Test;
import ru.mozhno.BaseIntegrationTest;
import ru.mozhno.apikeys.ApiKeyRepository;

import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

class UserRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByEmail_shouldReturnUser() {
        jdbcTemplate.execute("INSERT INTO users (email, password_hash, role) VALUES ('test@example.com', 'hash123', 'admin')");

        User user = userRepository.findByEmail("test@example.com");

        assertNotNull(user);
        assertEquals("test@example.com", user.getEmail());
        assertEquals("hash123", user.getPasswordHash());
        assertEquals("admin", user.getRole());
        assertNotNull(user.getCreatedAt());
    }

    @Test
    void findByEmail_shouldReturnNullForNonExistent() {
        User user = userRepository.findByEmail("nobody@example.com");
        assertNull(user);
    }

    @Test
    void findById_shouldReturnUser() {
        jdbcTemplate.execute("INSERT INTO users (email, password_hash, role) VALUES ('byid@example.com', 'hash', 'editor')");
        Integer id = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = 'byid@example.com'", Integer.class);

        User user = userRepository.findById(id);

        assertNotNull(user);
        assertEquals("byid@example.com", user.getEmail());
        assertEquals("editor", user.getRole());
    }

    @Test
    void findById_shouldReturnNullForNonExistent() {
        User user = userRepository.findById(9999);
        assertNull(user);
    }

    @Test
    void existsByEmail_shouldReturnTrue() {
        jdbcTemplate.execute("INSERT INTO users (email, password_hash, role) VALUES ('exists@example.com', 'hash', 'viewer')");
        assertTrue(userRepository.existsByEmail("exists@example.com"));
    }

    @Test
    void existsByEmail_shouldReturnFalse() {
        assertFalse(userRepository.existsByEmail("missing@example.com"));
    }
}