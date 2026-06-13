package dev.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.environments.Environment;
import dev.mozhno.environments.EnvironmentLimitProvider;
import dev.mozhno.environments.EnvironmentRepository;
import dev.mozhno.environments.EnvironmentService;

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
    private EnvironmentLimitProvider limitProvider;

    private EnvironmentService environmentService;

    @BeforeEach
    void setUp() {
        environmentService = new EnvironmentService(environmentRepository, events, limitProvider);
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
        when(limitProvider.getMaxEnvironments()).thenReturn(10);
        when(environmentRepository.countByProjectId(1)).thenReturn(0);
        when(environmentRepository.saveWithLimitCheck(eq(1), eq("production"), eq(10))).thenAnswer(inv -> {
            Environment e = new Environment();
            e.setId(1);
            e.setName(inv.getArgument(1));
            e.setProjectId(inv.getArgument(0));
            return e;
        });

        Environment result = environmentService.create(1, "production");
        assertNotNull(result);
        assertEquals("production", result.getName());
    }

    @Test
    void update_shouldUpdateAndReturn() {
        Environment existing = new Environment();
        existing.setId(1);
        existing.setName("old");
        when(environmentRepository.findById(1)).thenReturn(existing);
        when(environmentRepository.save(any(Environment.class))).thenReturn(existing);

        Environment result = environmentService.update(1, "new-name", null);
        assertEquals("new-name", result.getName());
    }

    @Test
    void update_shouldThrowExceptionWhenNotFound() {
        when(environmentRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> environmentService.update(999, "name", null));
        assertTrue(ex.getMessage().contains("Environment not found"));
    }

    @Test
    void delete_shouldCallRepository() {
        when(environmentRepository.deleteById(anyInt(), any())).thenReturn(1);
        environmentService.delete(1, null);
        verify(environmentRepository).deleteById(eq(1), any());
    }
}