package dev.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.segments.*;
import dev.mozhno.spi.QuotaSpi;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SegmentServiceTest {

    @Mock
    private SegmentRepository segmentRepository;

    @Mock
    private SegmentContextRepository segmentContextRepository;

    @Mock
    private DomainEventPublisher events;

    @Mock
    private QuotaSpi quotaSpi;

    private SegmentService segmentService;

    @BeforeEach
    void setUp() {
        segmentService = new SegmentService(segmentRepository, segmentContextRepository, events, quotaSpi);
        lenient().when(quotaSpi.canCreateSegment(any())).thenReturn(new QuotaSpi.Allowed());
    }

    @Test
    void findByProjectId_shouldReturnSegments() {
        Segment s = new Segment();
        s.setId(1);
        s.setProjectId(1);
        s.setName("Test Segment");
        when(segmentRepository.findByProjectId(1)).thenReturn(List.of(s));

        List<Segment> result = segmentService.findByProjectId(1);
        assertEquals(1, result.size());
        assertEquals("Test Segment", result.get(0).getName());
    }

    @Test
    void findById_shouldReturnSegment() {
        Segment s = new Segment();
        s.setId(1);
        s.setProjectId(1);
        s.setName("Power Users");
        when(segmentRepository.findById(1)).thenReturn(s);

        Segment result = segmentService.findById(1, null);
        assertEquals("Power Users", result.getName());
    }

    @Test
    void findById_shouldThrowExceptionWhenNotFound() {
        when(segmentRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> segmentService.findById(999, null));
        assertTrue(ex.getMessage().contains("Segment not found"));
    }

    @Test
    void create_shouldCreateSegmentWithContext() {
        when(segmentRepository.save(any(Segment.class))).thenAnswer(inv -> {
            Segment s = inv.getArgument(0);
            s.setId(1);
            return s;
        });
        doNothing().when(segmentContextRepository).saveBatch(anyInt(), anyList());

        SegmentRequest req = new SegmentRequest();
        req.setProjectId(1);
        req.setName("Power Users");
        req.setDescription("High-value users");

        SegmentRequest.ContextEntry entry = new SegmentRequest.ContextEntry();
        entry.setContextDefinitionId(2);
        entry.setContextValues("[\"web\",\"mobile\"]");
        req.setContext(List.of(entry));

        Segment result = segmentService.create(req);
        assertNotNull(result);
        assertEquals("Power Users", result.getName());
        verify(segmentContextRepository).saveBatch(eq(1), anyList());
    }

    @Test
    void create_shouldCreateSegmentWithoutContext() {
        when(segmentRepository.save(any(Segment.class))).thenAnswer(inv -> {
            Segment s = inv.getArgument(0);
            s.setId(1);
            return s;
        });

        SegmentRequest req = new SegmentRequest();
        req.setProjectId(1);
        req.setName("Empty Segment");
        req.setContext(null);

        Segment result = segmentService.create(req);
        assertNotNull(result);
        assertEquals("Empty Segment", result.getName());
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

        SegmentRequest req = new SegmentRequest();
        req.setName("New Name");
        req.setDescription("Updated");
        req.setContext(List.of());

        Segment result = segmentService.update(1, req);
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
        when(segmentRepository.deleteById(anyInt(), any())).thenReturn(1);
        segmentService.delete(1, null);
        verify(segmentRepository).deleteById(eq(1), any());
    }
}