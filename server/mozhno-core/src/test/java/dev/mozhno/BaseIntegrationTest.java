package dev.mozhno;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import dev.mozhno.apikeys.ApiKeyRepository;
import dev.mozhno.contexts.ContextDefinitionRepository;
import dev.mozhno.contexts.ContextValueRepository;
import dev.mozhno.environments.EnvironmentRepository;
import dev.mozhno.flags.FlagRepository;
import dev.mozhno.flags.FlagTagValueRepository;
import dev.mozhno.flags.strategy.FlagStrategyRepository;
import dev.mozhno.projects.ProjectRepository;
import dev.mozhno.segments.SegmentContextRepository;
import dev.mozhno.segments.SegmentRepository;
import dev.mozhno.tags.TagRepository;

@Testcontainers(parallel = true)
@SpringBootTest(properties = {
    "spring.flyway.enabled=true",
    "spring.sql.init.mode=never"
})
public abstract class BaseIntegrationTest {

    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withStartupTimeout(java.time.Duration.ofSeconds(120))
            .withCommand("postgres", "-c", "tcp_keepalives_idle=60", "-c", "tcp_keepalives_interval=10", "-c", "tcp_keepalives_count=3");

    static {
        postgres.start(); // Запуск один раз на всю JVM
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    @Autowired
    protected ProjectRepository projectRepository;

    @Autowired
    protected EnvironmentRepository environmentRepository;

    @Autowired
    protected TagRepository tagRepository;

    @Autowired
    protected ContextDefinitionRepository contextDefinitionRepository;

    @Autowired
    protected ContextValueRepository contextValueRepository;

    @Autowired
    protected FlagRepository flagRepository;

    @Autowired
    protected FlagStrategyRepository flagStrategyRepository;

    @Autowired
    protected FlagTagValueRepository flagTagValueRepository;

    @Autowired
    protected SegmentRepository segmentRepository;

    @Autowired
    protected SegmentContextRepository segmentContextRepository;

    @Autowired
    protected ApiKeyRepository apiKeyRepository;

    @BeforeEach
    void cleanDatabase() {
        try {
            jdbcTemplate.execute("TRUNCATE TABLE audit_log, integrations, project_settings, api_keys, flag_tag_values, flag_strategies, flags, segment_contexts, segments, context_values, context_definitions, tags, environments, projects, password_reset_tokens, invite_tokens, users CASCADE");
        } catch (org.springframework.dao.DataAccessException e) {
            // Tables may not exist on first run – schema will be created next
        }
    }
}