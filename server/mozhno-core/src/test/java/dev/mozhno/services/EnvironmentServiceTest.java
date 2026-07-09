package dev.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import dev.mozhno.apikeys.ApiKeyRepository;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.environments.Environment;
import dev.mozhno.environments.EnvironmentRepository;
import dev.mozhno.environments.EnvironmentService;
import dev.mozhno.spi.QuotaSpi;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EnvironmentServiceTest {

    @Mock
    private EnvironmentRepository environmentRepository;

    @Mock
    private DomainEventPublisher events;

    @Mock
    private QuotaSpi quotaSpi;

    @Mock
    private ApiKeyRepository apiKeyRepository;

    private EnvironmentService environmentService;

    @BeforeEach
    void setUp() {
        environmentService = new EnvironmentService(environmentRepository, events, quotaSpi, apiKeyRepository);
    }

    @Test
    void findByProjectId_shouldReturnEnvironments() {
        Environment e = new Environment();
        e.setId(1);
        e.setName("dev");
        when(environmentRepository.findByProjectId(1)).thenReturn(List.of(e));

        List<Environment> result = environmentService.findByProjectId(1);
        assertEquals(1, result.size());
    }

    @Test
    void findById_shouldReturnEnvironment() {
        Environment e = new Environment();
        e.setId(1);
        e.setName("staging");
        when(environmentRepository.findById(1)).thenReturn(e);

        Environment result = environmentService.findById(1, null);
        assertEquals("staging", result.getName());
    }

    @Test
    void findById_shouldThrowExceptionWhenNotFound() {
        when(environmentRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> environmentService.findById(999, null));
        assertTrue(ex.getMessage().contains("Environment not found"));
    }

    @Test
    void create_shouldCreateAndReturn() {
        when(quotaSpi.canCreateEnvironment(1)).thenReturn(new QuotaSpi.Allowed());
        when(environmentRepository.save(any(Environment.class))).thenAnswer(inv -> {
            Environment e = new Environment();
            e.setId(1);
            e.setName(inv.getArgument(0, Environment.class).getName());
            e.setColor(inv.getArgument(0, Environment.class).getColor());
            e.setDescription(inv.getArgument(0, Environment.class).getDescription());
            e.setRequireActivationApproval(inv.getArgument(0, Environment.class).isRequireActivationApproval());
            e.setProjectId(inv.getArgument(0, Environment.class).getProjectId());
            return e;
        });

        Environment result = environmentService.create(1, "production", "Prod env", "#2D9484", true);
        assertNotNull(result);
        assertEquals("production", result.getName());
        assertEquals("#2d9484", result.getColor());
        assertEquals("Prod env", result.getDescription());
        assertTrue(result.isRequireActivationApproval());
    }

    @Test
    void create_shouldRejectInvalidColor() {
        when(quotaSpi.canCreateEnvironment(1)).thenReturn(new QuotaSpi.Allowed());

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> environmentService.create(1, "production", null, "not-a-color", false));
        assertTrue(ex.getMessage().contains("hex"));
    }

    @Test
    void update_shouldUpdateAndReturn() {
        Environment existing = new Environment();
        existing.setId(1);
        existing.setName("old");
        when(environmentRepository.findById(1)).thenReturn(existing);
        when(environmentRepository.save(any(Environment.class))).thenReturn(existing);

        Environment result = environmentService.update(1, "new-name", null, null, false, null);
        assertEquals("new-name", result.getName());
    }

    @Test
    void update_shouldThrowExceptionWhenNotFound() {
        when(environmentRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> environmentService.update(999, "name", null, null, false, null));
        assertTrue(ex.getMessage().contains("Environment not found"));
    }

    @Test
    void delete_shouldCallRepository() {
        Environment env = new Environment();
        env.setId(1);
        env.setName("test");
        env.setProjectId(1);
        when(environmentRepository.findById(1)).thenReturn(env);
        when(apiKeyRepository.countByEnvironmentId(1, null)).thenReturn(0);
        when(environmentRepository.deleteById(anyInt(), any())).thenReturn(1);
        environmentService.delete(1, null);
        verify(environmentRepository).deleteById(eq(1), any());
    }

    @Test
    void delete_withLinkedApiKeys_shouldThrowException() {
        Environment env = new Environment();
        env.setId(1);
        env.setName("production");
        env.setProjectId(1);
        when(environmentRepository.findById(1)).thenReturn(env);
        when(apiKeyRepository.countByEnvironmentId(1, null)).thenReturn(3);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> environmentService.delete(1, null));
        assertTrue(ex.getMessage().contains("API key(s) are scoped"));
        verify(environmentRepository, never()).deleteById(anyInt(), any());
    }

    @Test
    void delete_withNoLinkedApiKeys_shouldSucceed() {
        Environment env = new Environment();
        env.setId(2);
        env.setName("staging");
        env.setProjectId(1);
        when(environmentRepository.findByIdAndProjectId(2, 1)).thenReturn(env);
        when(apiKeyRepository.countByEnvironmentId(2, 1)).thenReturn(0);
        when(environmentRepository.deleteById(2, 1)).thenReturn(1);
        environmentService.delete(2, 1);
        verify(environmentRepository).deleteById(2, 1);
    }
}
