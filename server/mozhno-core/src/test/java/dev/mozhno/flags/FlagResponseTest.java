package dev.mozhno.flags;

import dev.mozhno.flags.FlagResponse.TagValueResponse;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FlagResponseTest {

    @Test
    void builder_shouldCreateEmptyInstance() {
        FlagResponse resp = FlagResponse.builder().build();
        assertThat(resp.id()).isNull();
        assertThat(resp.name()).isNull();
        assertThat(resp.enabled()).isFalse();
        assertThat(resp.archived()).isFalse();
        assertThat(resp.tags()).isNull();
        assertThat(resp.segmentIds()).isNull();
    }

    @Test
    void builder_shouldSetAllFields() {
        Instant now = Instant.now();
        List<TagValueResponse> tags = List.of(TagValueResponse.builder().tagId(1).tagName("my-tag").tagColor("#fff").value("val").build());
        List<Integer> segmentIds = List.of(10, 20);

        FlagResponse resp = FlagResponse.builder()
            .id(1).projectId(100).name("Test Flag").key("test-flag")
            .description("A test flag").flagType("release").createdAt(now).createdBy("admin")
            .lastUsedAt(now).archivedBy("archiver").archivedAt(now)
            .tags(tags).enabled(true).strategyId(42).percentage(75.5)
            .contextDefinitionId(200).contextValuesJson("[{\"op\":\"in\"}]")
            .segmentIds(segmentIds).archived(false)
            .build();

        assertThat(resp.id()).isEqualTo(1);
        assertThat(resp.projectId()).isEqualTo(100);
        assertThat(resp.name()).isEqualTo("Test Flag");
        assertThat(resp.key()).isEqualTo("test-flag");
        assertThat(resp.description()).isEqualTo("A test flag");
        assertThat(resp.flagType()).isEqualTo("release");
        assertThat(resp.createdAt()).isEqualTo(now);
        assertThat(resp.createdBy()).isEqualTo("admin");
        assertThat(resp.lastUsedAt()).isEqualTo(now);
        assertThat(resp.archivedBy()).isEqualTo("archiver");
        assertThat(resp.archivedAt()).isEqualTo(now);
        assertThat(resp.tags()).isEqualTo(tags);
        assertThat(resp.enabled()).isTrue();
        assertThat(resp.strategyId()).isEqualTo(42);
        assertThat(resp.percentage()).isEqualTo(75.5);
        assertThat(resp.contextDefinitionId()).isEqualTo(200);
        assertThat(resp.contextValuesJson()).isEqualTo("[{\"op\":\"in\"}]");
        assertThat(resp.segmentIds()).isEqualTo(segmentIds);
        assertThat(resp.archived()).isFalse();
    }

    @Test
    void tagValueResponse_builder_shouldSetAllFields() {
        TagValueResponse tvr = TagValueResponse.builder()
            .tagId(10).tagName("Beta").tagColor("#0f0").value("yes")
            .build();
        assertThat(tvr.tagId()).isEqualTo(10);
        assertThat(tvr.tagName()).isEqualTo("Beta");
        assertThat(tvr.tagColor()).isEqualTo("#0f0");
        assertThat(tvr.value()).isEqualTo("yes");
    }
}
