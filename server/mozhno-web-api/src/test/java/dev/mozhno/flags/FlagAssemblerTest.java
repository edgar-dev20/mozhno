package dev.mozhno.flags;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.flags.strategy.FlagStrategy;
import dev.mozhno.projects.Project;
import dev.mozhno.tags.Tag;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FlagAssemblerTest extends BaseIntegrationTest {

    @Autowired
    private FlagAssembler flagAssembler;

    private Integer creatorId;
    private Integer projectId;
    private Tag tag1;
    private Tag tag2;

    @BeforeEach
    void prepareUsersAndProject() {
        jdbcTemplate.execute("INSERT INTO users (email, password_hash, name, role) VALUES ('creator@test.com', 'h', 'Creator', 'admin')");
        creatorId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = 'creator@test.com'", Integer.class);

        Project p = new Project();
        p.setName("Test Project");
        projectId = projectRepository.save(p).getId();

        tag1 = new Tag();
        tag1.setName("tag-alpha");
        tag1.setColor("#ff0000");
        tag1.setProjectId(projectId);
        tag1 = tagRepository.save(tag1);

        tag2 = new Tag();
        tag2.setName("tag-beta");
        tag2.setColor("#00ff00");
        tag2.setProjectId(projectId);
        tag2 = tagRepository.save(tag2);
    }

    @Test
    void toResponses_shouldResolveCreatorName() {
        Flag flag = new Flag();
        flag.setName("Feature X");
        flag.setKey("feature-x");
        flag.setProjectId(projectId);
        flag.setFlagType(FlagType.RELEASE);
        flag.setCreatorId(creatorId);
        Flag saved = flagRepository.save(flag);

        List<FlagResponse> responses = flagAssembler.toResponses(List.of(new FlagWithStrategy(saved, null)));

        assertEquals(1, responses.size());
        FlagResponse r = responses.get(0);
        assertEquals("Feature X", r.name());
        assertNotNull(r.createdBy());
        assertTrue(r.createdBy().contains("Creator"));
        assertTrue(r.createdBy().contains("creator@test.com"));
    }

    @Test
    void toResponses_shouldHandleFlagsWithoutCreator() {
        Flag flag = new Flag();
        flag.setName("No Creator");
        flag.setKey("no-creator");
        flag.setProjectId(projectId);
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        List<FlagResponse> responses = flagAssembler.toResponses(List.of(new FlagWithStrategy(saved, null)));

        assertEquals(1, responses.size());
        assertNull(responses.get(0).createdBy());
    }

    @Test
    void toResponses_shouldReturnEmptyForEmptyList() {
        List<FlagResponse> responses = flagAssembler.toResponses(List.of());
        assertTrue(responses.isEmpty());
    }

    @Test
    void toResponses_shouldResolveArchivedBy() {
        jdbcTemplate.execute("INSERT INTO users (email, password_hash, name, role) VALUES ('archiver@test.com', 'h', 'Archiver', 'admin')");
        Integer archiverId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = 'archiver@test.com'", Integer.class);

        Flag flag = new Flag();
        flag.setName("Archived Flag");
        flag.setKey("archived-flag");
        flag.setProjectId(projectId);
        flag.setFlagType(FlagType.RELEASE);
        flag.setCreatorId(creatorId);
        flag.setArchivedBy(archiverId);
        Flag saved = flagRepository.save(flag);

        List<FlagResponse> responses = flagAssembler.toResponses(List.of(new FlagWithStrategy(saved, null)));

        assertEquals(1, responses.size());
        FlagResponse r = responses.get(0);
        assertNotNull(r.archivedBy());
        assertTrue(r.archivedBy().contains("Archiver"));
    }

    @Test
    void toResponses_shouldBatchMultipleFlagsWithSameCreator() {
        Flag f1 = new Flag();
        f1.setName("Flag 1");
        f1.setKey("flag-1");
        f1.setProjectId(projectId);
        f1.setFlagType(FlagType.RELEASE);
        f1.setCreatorId(creatorId);
        Flag s1 = flagRepository.save(f1);

        Flag f2 = new Flag();
        f2.setName("Flag 2");
        f2.setKey("flag-2");
        f2.setProjectId(projectId);
        f2.setFlagType(FlagType.KILLSWITCH);
        f2.setCreatorId(creatorId);
        Flag s2 = flagRepository.save(f2);

        List<FlagResponse> responses = flagAssembler.toResponses(List.of(
            new FlagWithStrategy(s1, null),
            new FlagWithStrategy(s2, null)
        ));

        assertEquals(2, responses.size());
        for (FlagResponse r : responses) {
            assertTrue(r.createdBy().contains("Creator"));
        }
    }

    @Test
    void toResponses_shouldIncludeTags() {
        Flag flag = new Flag();
        flag.setName("Tagged Flag");
        flag.setKey("tagged-flag");
        flag.setProjectId(projectId);
        flag.setFlagType(FlagType.RELEASE);
        flag.setCreatorId(creatorId);
        Flag saved = flagRepository.save(flag);

        FlagTagValue ftv = new FlagTagValue();
        ftv.setFlagId(saved.getId());
        ftv.setTagId(tag1.getId());
        ftv.setTagValue("v1");
        flagTagValueRepository.save(ftv);

        List<FlagResponse> responses = flagAssembler.toResponses(List.of(new FlagWithStrategy(saved, null)));

        assertEquals(1, responses.size());
        List<FlagResponse.TagValueResponse> tags = responses.get(0).tags();
        assertEquals(1, tags.size());
        assertEquals(tag1.getId(), tags.get(0).tagId());
        assertEquals("tag-alpha", tags.get(0).tagName());
        assertEquals("#ff0000", tags.get(0).tagColor());
        assertEquals("v1", tags.get(0).value());
    }

    @Test
    void toResponses_shouldIncludeStrategyFieldsWhenPresent() {
        dev.mozhno.environments.Environment env = new dev.mozhno.environments.Environment();
        env.setName("dev");
        env.setProjectId(projectId);
        Integer envId = environmentRepository.save(env).getId();

        Flag flag = new Flag();
        flag.setName("Strategy Flag");
        flag.setKey("strategy-flag");
        flag.setProjectId(projectId);
        flag.setFlagType(FlagType.RELEASE);
        flag.setCreatorId(creatorId);
        Flag saved = flagRepository.save(flag);

        FlagStrategy strategy = new FlagStrategy();
        strategy.setFlagId(saved.getId());
        strategy.setEnvironmentId(envId);
        strategy.setEnabled(true);
        strategy.setPercentage(50.0);
        strategy.setSegmentIds(List.of());
        flagStrategyRepository.save(strategy);

        List<FlagResponse> responses = flagAssembler.toResponses(List.of(new FlagWithStrategy(saved, strategy)));

        assertEquals(1, responses.size());
        FlagResponse r = responses.get(0);
        assertTrue(r.enabled());
        assertEquals(50.0, r.percentage());
        assertNotNull(r.strategyId());
    }

    @Test
    void toEnrichedResponses_shouldResolveCreatorNames() {
        Flag flag = new Flag();
        flag.setName("Enriched Flag");
        flag.setKey("enriched-flag");
        flag.setProjectId(projectId);
        flag.setFlagType(FlagType.RELEASE);
        flag.setCreatorId(creatorId);
        flagRepository.save(flag);

        List<FlagWithStrategy> flags = flagRepository.findByProjectIdWithAllEnvironmentStrategies(projectId);
        List<EnrichedFlagResponse> responses = flagAssembler.toEnrichedResponses(flags);

        assertEquals(1, responses.size());
        EnrichedFlagResponse r = responses.get(0);
        assertTrue(r.createdBy().contains("Creator"));
    }

    @Test
    void toEnrichedResponses_shouldHandleArchivedBy() {
        jdbcTemplate.execute("INSERT INTO users (email, password_hash, name, role) VALUES ('archiver2@test.com', 'h', 'Archiver2', 'admin')");
        Integer archiverId2 = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = 'archiver2@test.com'", Integer.class);

        Flag flag = new Flag();
        flag.setName("Enriched Archived");
        flag.setKey("enriched-archived");
        flag.setProjectId(projectId);
        flag.setFlagType(FlagType.RELEASE);
        flag.setCreatorId(creatorId);
        flagRepository.save(flag);
        flagRepository.setArchived(flag.getId(), true, archiverId2, flag.getProjectId());

        List<FlagWithStrategy> flags = flagRepository.findByProjectIdWithAllEnvironmentStrategies(projectId);
        List<EnrichedFlagResponse> responses = flagAssembler.toEnrichedResponses(flags);

        assertEquals(1, responses.size());
        assertNotNull(responses.get(0).archivedBy());
        assertTrue(responses.get(0).archivedBy().contains("Archiver2"));
    }

    @Test
    void toEnrichedResponses_shouldReturnEmptyForEmptyList() {
        List<EnrichedFlagResponse> responses = flagAssembler.toEnrichedResponses(List.of());
        assertTrue(responses.isEmpty());
    }

    @Test
    void toEnrichedResponses_shouldGroupMultipleStrategiesPerFlag() {
        dev.mozhno.environments.Environment devEnv = new dev.mozhno.environments.Environment();
        devEnv.setName("dev");
        devEnv.setProjectId(projectId);
        Integer devId = environmentRepository.save(devEnv).getId();

        dev.mozhno.environments.Environment prodEnv = new dev.mozhno.environments.Environment();
        prodEnv.setName("prod");
        prodEnv.setProjectId(projectId);
        Integer prodId = environmentRepository.save(prodEnv).getId();

        Flag flag = new Flag();
        flag.setName("Multi-Env Flag");
        flag.setKey("multi-env");
        flag.setProjectId(projectId);
        flag.setFlagType(FlagType.RELEASE);
        flag.setCreatorId(creatorId);
        flagRepository.save(flag);

        Flag saved = flagRepository.findByProjectIdAndKey(projectId, "multi-env");

        FlagStrategy s1 = new FlagStrategy();
        s1.setFlagId(saved.getId());
        s1.setEnvironmentId(devId);
        s1.setEnabled(true);
        s1.setPercentage(100.0);
        flagStrategyRepository.save(s1);

        FlagStrategy s2 = new FlagStrategy();
        s2.setFlagId(saved.getId());
        s2.setEnvironmentId(prodId);
        s2.setEnabled(false);
        s2.setPercentage(0.0);
        flagStrategyRepository.save(s2);

        List<FlagWithStrategy> flags = flagRepository.findByProjectIdWithAllEnvironmentStrategies(projectId);
        List<EnrichedFlagResponse> responses = flagAssembler.toEnrichedResponses(flags);

        assertEquals(1, responses.size());
        EnrichedFlagResponse r = responses.get(0);
        assertEquals(2, r.environments().size());
    }
}
