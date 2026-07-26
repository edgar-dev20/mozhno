package dev.mozhno.config;

import dev.mozhno.auth.UserRepository;
import dev.mozhno.projects.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers(parallel = true)
@SpringBootTest(properties = {
        "spring.flyway.enabled=true",
        "spring.sql.init.mode=never",
        "mozhno.jwt.secret=dGhpc2lzYXRlc3RzZWNyZXRrZXlmb3Jqd3R0aGF0aXNhdGxlYXN0MzJieXRlc2xvbmc="
})
class BootstrapRunnerTest {

    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withStartupTimeout(java.time.Duration.ofSeconds(120))
            .withCommand("postgres", "-c", "tcp_keepalives_idle=60",
                    "-c", "tcp_keepalives_interval=10", "-c", "tcp_keepalives_count=3");

    static {
        postgres.start();
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private BootstrapRunner bootstrapRunner;
    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void cleanDb() {
        jdbc.execute("DELETE FROM project_settings");
        jdbc.execute("DELETE FROM refresh_tokens");
        jdbc.execute("DELETE FROM users");
        jdbc.execute("DELETE FROM projects");
    }

    @Test
    void shouldNotCreateAdminWithoutEnvVars() {
        bootstrapRunner.run(null);

        assertThat(userRepository.count()).isZero();
        assertThat(projectRepository.count()).isEqualTo(1);
    }

    @Test
    void shouldCreateAdminWithEnvVars() {
        System.setProperty("MOZHNO_INIT_EMAIL", "admin@test.com");
        System.setProperty("MOZHNO_INIT_PASSWORD", "secret123");
        try {
            bootstrapRunner.run(null);

            assertThat(userRepository.count()).isEqualTo(1);
            var user = userRepository.findByEmail("admin@test.com");
            assertThat(user).isNotNull();
            assertThat(user.getRole()).isEqualTo("admin");
            assertThat(user.getStatus()).isEqualTo("active");
            assertThat(user.getLocale()).isEqualTo("en");
            assertThat(user.getPasswordHash()).startsWith("$2a$");
        } finally {
            System.clearProperty("MOZHNO_INIT_EMAIL");
            System.clearProperty("MOZHNO_INIT_PASSWORD");
        }
    }

    @Test
    void shouldNotRecreateAdminWhenUsersExist() {
        System.setProperty("MOZHNO_INIT_EMAIL", "admin@test.com");
        System.setProperty("MOZHNO_INIT_PASSWORD", "secret123");
        try {
            bootstrapRunner.run(null);
            assertThat(userRepository.count()).isEqualTo(1);
            String firstHash = userRepository.findByEmail("admin@test.com").getPasswordHash();

            bootstrapRunner.run(null);

            assertThat(userRepository.count()).isEqualTo(1);
            assertThat(userRepository.findByEmail("admin@test.com").getPasswordHash())
                    .isEqualTo(firstHash);
        } finally {
            System.clearProperty("MOZHNO_INIT_EMAIL");
            System.clearProperty("MOZHNO_INIT_PASSWORD");
        }
    }

    @Test
    void shouldNotRecreateProjectWhenProjectsExist() {
        bootstrapRunner.run(null);
        assertThat(projectRepository.count()).isEqualTo(1);
        String firstName = projectRepository.findAll().getFirst().getName();

        bootstrapRunner.run(null);

        assertThat(projectRepository.count()).isEqualTo(1);
        assertThat(projectRepository.findAll().getFirst().getName()).isEqualTo(firstName);
    }
}
