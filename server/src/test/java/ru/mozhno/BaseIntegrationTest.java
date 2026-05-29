package ru.mozhno;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import ru.mozhno.contexts.ContextDefinitionRepository;
import ru.mozhno.contexts.ContextValueRepository;
import ru.mozhno.environments.EnvironmentRepository;
import ru.mozhno.flags.FlagRepository;
import ru.mozhno.flags.FlagTagValueRepository;
import ru.mozhno.flags.strategy.FlagStrategyRepository;
import ru.mozhno.projects.ProjectRepository;
import ru.mozhno.segments.SegmentContextRepository;
import ru.mozhno.segments.SegmentRepository;
import ru.mozhno.tags.TagRepository;

@Testcontainers(parallel = true)
@SpringBootTest(properties = {
    "spring.flyway.enabled=false"
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

    @BeforeEach
    void cleanDatabase() {
        try {
            jdbcTemplate.execute("TRUNCATE TABLE flag_tag_values, flag_strategies, flags, segment_contexts, segments, context_values, context_definitions, tags, environments, projects CASCADE");
        } catch (Exception e) {
            // Tables may not exist on first run – schema will be created next
        }
    }
}