package dev.mozhno.client;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientInstanceServiceTest {

    @Mock
    private ClientInstanceRepository repository;

    private ClientInstanceService service;

    @BeforeEach
    void setUp() {
        ClientProperties clientProperties = new ClientProperties();
        clientProperties.setInstanceRetentionDays(30);
        service = new ClientInstanceService(repository, clientProperties);
    }

    @Test
    void record_withNullAppName_shouldNotUpsert() {
        service.record(1, 2, 3, null, "inst-1", "web", "1.0.0", "SERVER");
        verifyNoInteractions(repository);
    }

    @Test
    void record_withNullInstanceId_shouldNotUpsert() {
        service.record(1, 2, 3, "MyApp", null, "web", "1.0.0", "SERVER");
        verifyNoInteractions(repository);
    }

    @Test
    void record_withValidData_shouldUpsert() {
        service.record(1, 2, 3, "MyApp", "inst-1", "web", "1.0.0", "SERVER");
        verify(repository).upsert(1, 2, 3, "MyApp", "inst-1", "web", "1.0.0", "SERVER");
    }

    @Test
    void getInstances_withEnvironmentId_shouldFilterByEnvironment() {
        ClientInstance ci = new ClientInstance();
        ci.setAppName("App");
        when(repository.findByProjectIdAndEnvironmentId(1, 2)).thenReturn(List.of(ci));

        List<ClientInstance> result = service.getInstances(1, 2);

        assertThat(result).hasSize(1);
        verify(repository).findByProjectIdAndEnvironmentId(1, 2);
        verify(repository, never()).findByProjectId(anyInt());
    }

    @Test
    void getInstances_withNullEnvironmentId_shouldReturnAllForProject() {
        ClientInstance ci = new ClientInstance();
        ci.setAppName("App2");
        when(repository.findByProjectId(1)).thenReturn(List.of(ci));

        List<ClientInstance> result = service.getInstances(1, null);

        assertThat(result).hasSize(1);
        verify(repository).findByProjectId(1);
        verify(repository, never()).findByProjectIdAndEnvironmentId(anyInt(), any());
    }
}
