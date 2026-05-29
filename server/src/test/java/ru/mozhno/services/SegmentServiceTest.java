package ru.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.mozhno.segments.*;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SegmentServiceTest {

    @Mock
    private SegmentRepository segmentRepository;

    @Mock
    private SegmentContextRepository segmentContextRepository;

    private SegmentService segmentService;

    @BeforeEach
    void setUp() {
        segmentService = new SegmentService(segmentRepository, segmentContextRepository);
    }

    @Test
    void findByProjectId_shouldReturnSegments() {
        Segment s = new Segment();
        s.setId(1);
        s.setProjectId(1);
        s.setName("Test Segment");
        when(segmentRepository.findByProjectId(1)).thenReturn(List.of(s));
        when(segmentContextRepository.findBySegmentId(1)).thenReturn(List.of());

        List<SegmentResponse> result = segmentService.findByProjectId(1);
        assertEquals(1, result.size());
        assertEquals("Test Segment", result.get(0).getName());
    }

    @Test
    void findById_shouldReturnSegmentWithContext() {
        Segment s = new Segment();
        s.setId(1);
        s.setProjectId(1);
        s.setName("Power Users");
        when(segmentRepository.findById(1)).thenReturn(s);

        SegmentContext sc = new SegmentContext();
        sc.setId(1);
        sc.setSegmentId(1);
        sc.setContextDefinitionId(2);
        sc.setContextValues("[\"web\"]");
        when(segmentContextRepository.findBySegmentId(1)).thenReturn(List.of(sc));

        SegmentResponse result = segmentService.findById(1);
        assertEquals("Power Users", result.getName());
        assertEquals(1, result.getContext().size());
        assertEquals(2, result.getContext().get(0).getContextDefinitionId());
    }

    @Test
    void findById_shouldThrowExceptionWhenNotFound() {
        when(segmentRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> segmentService.findById(999));
        assertTrue(ex.getMessage().contains("Segment not found"));
    }

    @Test
    void create_shouldCreateSegmentWithContext() {
        when(segmentRepository.save(any(Segment.class))).thenAnswer(inv -> {
            Segment s = inv.getArgument(0);
            s.setId(1);
            return s;
        });
        when(segmentContextRepository.save(any(SegmentContext.class))).thenAnswer(inv -> inv.getArgument(0));

        SegmentContext savedCtx = new SegmentContext();
        savedCtx.setSegmentId(1);
        savedCtx.setContextDefinitionId(2);
        savedCtx.setContextValues("[\"web\",\"mobile\"]");
        when(segmentContextRepository.findBySegmentId(1)).thenReturn(List.of(savedCtx));

        SegmentRequest req = new SegmentRequest();
        req.setProjectId(1);
        req.setName("Power Users");
        req.setDescription("High-value users");

        SegmentRequest.ContextEntry entry = new SegmentRequest.ContextEntry();
        entry.setContextDefinitionId(2);
        entry.setContextValues("[\"web\",\"mobile\"]");
        req.setContext(List.of(entry));

        SegmentResponse result = segmentService.create(req);
        assertNotNull(result);
        assertEquals("Power Users", result.getName());
        assertEquals(1, result.getContext().size());
        verify(segmentContextRepository).save(any(SegmentContext.class));
    }

    @Test
    void create_shouldCreateSegmentWithoutContext() {
        when(segmentRepository.save(any(Segment.class))).thenAnswer(inv -> {
            Segment s = inv.getArgument(0);
            s.setId(1);
            return s;
        });
        when(segmentContextRepository.findBySegmentId(1)).thenReturn(List.of());

        SegmentRequest req = new SegmentRequest();
        req.setProjectId(1);
        req.setName("Empty Segment");
        req.setContext(null);

        SegmentResponse result = segmentService.create(req);
        assertNotNull(result);
        assertEquals("Empty Segment", result.getName());
        assertTrue(result.getContext().isEmpty());
    }

    @Test
    void update_shouldUpdateSegmentAndReplaceContext() {
        Segment existing = new Segment();
        existing.setId(1);
        existing.setProjectId(1);
        existing.setName("Old Name");
        when(segmentRepository.findById(1)).thenReturn(existing);
        when(segmentRepository.save(any(Segment.class))).thenReturn(existing);
        doNothing().when(segmentContextRepository).deleteBySegmentId(1);
        when(segmentContextRepository.findBySegmentId(1)).thenReturn(List.of());

        SegmentRequest req = new SegmentRequest();
        req.setName("New Name");
        req.setDescription("Updated");
        req.setContext(List.of());

        SegmentResponse result = segmentService.update(1, req);
        assertEquals("New Name", result.getName());
        verify(segmentContextRepository).deleteBySegmentId(1);
    }

    @Test
    void update_shouldThrowExceptionWhenNotFound() {
        when(segmentRepository.findById(999)).thenReturn(null);

        SegmentRequest req = new SegmentRequest();
        req.setName("Test");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> segmentService.update(999, req));
        assertTrue(ex.getMessage().contains("Segment not found"));
    }

    @Test
    void delete_shouldCallRepository() {
        doNothing().when(segmentRepository).deleteById(1);
        segmentService.delete(1);
        verify(segmentRepository).deleteById(1);
    }
}