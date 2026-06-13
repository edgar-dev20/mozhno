package dev.mozhno.client;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class ClientInstanceTest {

    @Test
    void defaultConstructor_shouldCreateEmptyInstance() {
        ClientInstance ci = new ClientInstance();
        assertThat(ci.getId()).isNull();
        assertThat(ci.getProjectId()).isNull();
        assertThat(ci.getEnvironmentId()).isNull();
        assertThat(ci.getApiKeyId()).isNull();
        assertThat(ci.getAppName()).isNull();
        assertThat(ci.getInstanceId()).isNull();
        assertThat(ci.getAppType()).isNull();
        assertThat(ci.getSdkVersion()).isNull();
        assertThat(ci.getKeyType()).isNull();
        assertThat(ci.getFirstSeenAt()).isNull();
        assertThat(ci.getLastSeenAt()).isNull();
    }

    @Test
    void settersAndGetters_shouldWork() {
        ClientInstance ci = new ClientInstance();
        Instant first = Instant.now();
        Instant last = Instant.now().plusSeconds(3600);

        ci.setId(1L);
        ci.setProjectId(100);
        ci.setEnvironmentId(200);
        ci.setApiKeyId(300);
        ci.setAppName("MyApp");
        ci.setInstanceId("inst-123");
        ci.setAppType("web");
        ci.setSdkVersion("2.0.0");
        ci.setKeyType("SERVER");
        ci.setFirstSeenAt(first);
        ci.setLastSeenAt(last);

        assertThat(ci.getId()).isEqualTo(1L);
        assertThat(ci.getProjectId()).isEqualTo(100);
        assertThat(ci.getEnvironmentId()).isEqualTo(200);
        assertThat(ci.getApiKeyId()).isEqualTo(300);
        assertThat(ci.getAppName()).isEqualTo("MyApp");
        assertThat(ci.getInstanceId()).isEqualTo("inst-123");
        assertThat(ci.getAppType()).isEqualTo("web");
        assertThat(ci.getSdkVersion()).isEqualTo("2.0.0");
        assertThat(ci.getKeyType()).isEqualTo("SERVER");
        assertThat(ci.getFirstSeenAt()).isEqualTo(first);
        assertThat(ci.getLastSeenAt()).isEqualTo(last);
    }
}
