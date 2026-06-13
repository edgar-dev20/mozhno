package dev.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.contexts.*;
import dev.mozhno.segments.SegmentContextRepository;
import dev.mozhno.spi.QuotaSpi;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContextServiceTest {

    @Mock
    private ContextDefinitionRepository contextDefinitionRepository;

    @Mock
    private ContextValueRepository contextValueRepository;

    @Mock
    private SegmentContextRepository segmentContextRepository;

    @Mock
    private DomainEventPublisher events;

    @Mock
    private QuotaSpi quotaSpi;

    private ContextService contextService;

    @BeforeEach
    void setUp() {
        contextService = new ContextService(contextDefinitionRepository, contextValueRepository, segmentContextRepository, events, quotaSpi);
        lenient().when(quotaSpi.canCreateContext(any())).thenReturn(new QuotaSpi.Allowed());
    }

    @Test
    void findDefinitionsByProjectId_shouldReturnDefinitions() {
        ContextDefinition def = new ContextDefinition();
        def.setId(1);
        def.setName("userId");
        when(contextDefinitionRepository.findByProjectId(1)).thenReturn(List.of(def));

        List<ContextDefinition> result = contextService.findDefinitionsByProjectId(1);
        assertEquals(1, result.size());
        assertEquals("userId", result.get(0).getName());
    }

    @Test
    void findDefinitionById_shouldReturnDefinition() {
        ContextDefinition def = new ContextDefinition();
        def.setId(1);
        def.setName("appName");
        when(contextDefinitionRepository.findById(1)).thenReturn(def);

        ContextDefinition result = contextService.findDefinitionById(1, null);
        assertEquals("appName", result.getName());
    }

    @Test
    void findDefinitionById_shouldThrowExceptionWhenNotFound() {
        when(contextDefinitionRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> contextService.findDefinitionById(999, null));
        assertTrue(ex.getMessage().contains("ContextDefinition not found"));
    }

    @Test
    void createDefinition_shouldCreateAndReturn() {
        ContextDefinitionRequest request = new ContextDefinitionRequest();
        request.setName("appName");
        request.setDescription("Application name");
        request.setProjectId(1);

        when(contextDefinitionRepository.save(any(ContextDefinition.class))).thenAnswer(inv -> {
            ContextDefinition d = inv.getArgument(0);
            d.setId(1);
            return d;
        });

        ContextDefinition result = contextService.createDefinition(request, null);
        assertNotNull(result);
        assertEquals("appName", result.getName());
    }

    @Test
    void updateDefinition_shouldUpdateAndReturn() {
        ContextDefinition existing = new ContextDefinition();
        existing.setId(1);
        existing.setName("old");
        when(contextDefinitionRepository.findById(1)).thenReturn(existing);
        when(contextDefinitionRepository.save(any(ContextDefinition.class))).thenReturn(existing);

        ContextDefinitionRequest request = new ContextDefinitionRequest();
        request.setName("new");
        request.setDescription("Updated");

        ContextDefinition result = contextService.updateDefinition(1, request);
        assertEquals("new", result.getName());
    }

    @Test
    void deleteDefinition_shouldCallRepository() {
        when(segmentContextRepository.existsByContextDefinitionId(1)).thenReturn(false);
        when(contextDefinitionRepository.deleteById(anyInt(), any())).thenReturn(1);
        contextService.deleteDefinition(1, null);
        verify(contextDefinitionRepository).deleteById(eq(1), any());
    }

    @Test
    void deleteDefinition_shouldThrowWhenUsedBySegments() {
        when(segmentContextRepository.existsByContextDefinitionId(1)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> contextService.deleteDefinition(1, null));
        assertTrue(ex.getMessage().contains("Cannot delete context"));
        verify(contextDefinitionRepository, never()).deleteById(anyInt(), any());
    }

    @Test
    void deleteDefinition_shouldThrowWhenNotFound() {
        when(segmentContextRepository.existsByContextDefinitionId(999)).thenReturn(false);
        when(contextDefinitionRepository.deleteById(eq(999), any())).thenReturn(0);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> contextService.deleteDefinition(999, null));
        assertTrue(ex.getMessage().contains("not found"));
    }

    @Test
    void findValuesByContextDefinitionId_shouldReturnValues() {
        ContextValue cv = new ContextValue();
        cv.setId(1);
        cv.setValues("[\"web\"]");
        ContextDefinition def = new ContextDefinition();
        def.setId(1);
        when(contextDefinitionRepository.findById(1)).thenReturn(def);
        when(contextValueRepository.findByContextDefinitionId(1)).thenReturn(List.of(cv));

        List<ContextValue> result = contextService.findValuesByContextDefinitionId(1, null);
        assertEquals(1, result.size());
    }

    @Test
    void findValueById_shouldReturnValue() {
        ContextValue cv = new ContextValue();
        cv.setId(1);
        cv.setValues("[\"test\"]");
        when(contextValueRepository.findById(1)).thenReturn(cv);

        ContextValue result = contextService.findValueById(1, null);
        assertEquals("[\"test\"]", result.getValues());
    }

    @Test
    void findValueById_shouldThrowExceptionWhenNotFound() {
        when(contextValueRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> contextService.findValueById(999, null));
        assertTrue(ex.getMessage().contains("ContextValue not found"));
    }

    @Test
    void createValue_shouldCreateAndReturn() {
        ContextValueRequest request = new ContextValueRequest();
        request.setContextDefinitionId(1);
        request.setValues("[\"new-value\"]");

        when(contextValueRepository.save(any(ContextValue.class))).thenAnswer(inv -> {
            ContextValue cv = inv.getArgument(0);
            cv.setId(1);
            return cv;
        });

        ContextValue result = contextService.createValue(request, null);
        assertNotNull(result);
        assertEquals("[\"new-value\"]", result.getValues());
    }

    @Test
    void updateValue_shouldUpdateAndReturn() {
        ContextValue existing = new ContextValue();
        existing.setId(1);
        existing.setValues("[\"old\"]");
        when(contextValueRepository.findById(1)).thenReturn(existing);
        when(contextValueRepository.save(any(ContextValue.class))).thenReturn(existing);

        ContextValueRequest request = new ContextValueRequest();
        request.setValues("[\"new\"]");

        ContextValue result = contextService.updateValue(1, request, null);
        assertEquals("[\"new\"]", result.getValues());
    }

    @Test
    void updateValue_shouldThrowExceptionWhenNotFound() {
        when(contextValueRepository.findById(999)).thenReturn(null);

        ContextValueRequest request = new ContextValueRequest();
        request.setValues("[\"x\"]");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> contextService.updateValue(999, request, null));
        assertTrue(ex.getMessage().contains("ContextValue not found"));
    }

    @Test
    void deleteValue_shouldCallRepository() {
        ContextValue value = new ContextValue();
        value.setId(1);
        value.setContextDefinitionId(10);
        when(contextValueRepository.findById(1)).thenReturn(value);
        doNothing().when(contextValueRepository).deleteById(1);
        contextService.deleteValue(1, null);
        verify(contextValueRepository).deleteById(1);
    }
}