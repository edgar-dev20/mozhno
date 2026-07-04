package dev.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.flags.*;
import dev.mozhno.spi.QuotaSpi;
import dev.mozhno.tags.Tag;
import dev.mozhno.tags.TagRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FlagServiceTest {

    @Mock
    private FlagRepository flagRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private FlagTagValueRepository flagTagValueRepository;

    @Mock
    private DomainEventPublisher events;

    @Mock
    private QuotaSpi quotaSpi;

    private FlagService flagService;

    @BeforeEach
    void setUp() {
        flagService = new FlagService(flagRepository, tagRepository, flagTagValueRepository, events, quotaSpi,
            new FlagsProperties());
        lenient().when(quotaSpi.canCreateFlag(any())).thenReturn(new QuotaSpi.Allowed());
    }

    @Test
    void findById_shouldReturnFlag() {
        Flag flag = new Flag();
        flag.setId(1);
        flag.setName("test");
        when(flagRepository.findByIdAndProjectId(1, null)).thenReturn(flag);

        Flag result = flagService.findById(1, null);
        assertEquals("test", result.getName());
    }

    @Test
    void findById_shouldThrowExceptionWhenNotFound() {
        when(flagRepository.findByIdAndProjectId(999, null)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> flagService.findById(999, null));
        assertTrue(ex.getMessage().contains("Flag not found"));
    }

    @Test
    void unarchive_shouldThrowExceptionWhenNotFound() {
        when(flagRepository.clearArchived(eq(999), any())).thenReturn(0);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> flagService.unarchive(999, null));
        assertTrue(ex.getMessage().contains("Flag not found"));
    }

    @Test
    void findByProjectIdIncludingArchived_shouldReturnAllFlags() {
        when(flagRepository.findByProjectIdIncludingArchived(1)).thenReturn(List.of(new Flag()));

        List<Flag> result = flagService.findByProjectIdIncludingArchived(1);
        assertEquals(1, result.size());
    }
}