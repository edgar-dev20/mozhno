package ru.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.mozhno.events.DomainEventPublisher;
import ru.mozhno.flags.*;
import ru.mozhno.projects.Project;
import ru.mozhno.projects.ProjectRepository;
import ru.mozhno.spi.QuotaSpi;
import ru.mozhno.tags.Tag;
import ru.mozhno.tags.TagRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FlagServiceTest {

    @Mock
    private FlagRepository flagRepository;

    @Mock
    private ProjectRepository projectRepository;

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
        flagService = new FlagService(flagRepository, projectRepository, tagRepository, flagTagValueRepository, events, quotaSpi);
        lenient().when(quotaSpi.canCreateFlag(any())).thenReturn(new QuotaSpi.Allowed());
    }

    @Test
    void findById_shouldReturnFlag() {
        Flag flag = new Flag();
        flag.setId(1);
        flag.setName("test");
        when(flagRepository.findById(1)).thenReturn(flag);

        Flag result = flagService.findById(1);
        assertEquals("test", result.getName());
    }

    @Test
    void findById_shouldThrowExceptionWhenNotFound() {
        when(flagRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> flagService.findById(999));
        assertTrue(ex.getMessage().contains("Flag not found"));
    }

    @Test
    void findByProjectId_shouldReturnFlags() {
        Project p = new Project();
        p.setId(1);
        when(projectRepository.findById(1)).thenReturn(p);
        Flag flag = new Flag();
        flag.setId(1);
        flag.setName("f1");
        when(flagRepository.findByProjectId(1)).thenReturn(List.of(flag));

        List<Flag> result = flagService.findByProjectId(1);
        assertEquals(1, result.size());
    }

    @Test
    void findByProjectId_shouldThrowExceptionWhenProjectNotFound() {
        when(projectRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> flagService.findByProjectId(999));
        assertTrue(ex.getMessage().contains("Project not found"));
    }

    @Test
    void findByProjectIdAndKey_shouldReturnFlag() {
        Project p = new Project();
        p.setId(1);
        when(projectRepository.findById(1)).thenReturn(p);
        Flag flag = new Flag();
        flag.setId(1);
        when(flagRepository.findByProjectIdAndKey(1, "key1")).thenReturn(flag);

        Flag result = flagService.findByProjectIdAndKey(1, "key1");
        assertNotNull(result);
    }

    @Test
    void findByProjectIdAndKey_shouldThrowExceptionWhenProjectNotFound() {
        when(projectRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> flagService.findByProjectIdAndKey(999, "x"));
        assertTrue(ex.getMessage().contains("Project not found"));
    }

    @Test
    void findByProjectIdAndKey_shouldThrowExceptionWhenFlagNotFound() {
        Project p = new Project();
        p.setId(1);
        when(projectRepository.findById(1)).thenReturn(p);
        when(flagRepository.findByProjectIdAndKey(1, "nokey")).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> flagService.findByProjectIdAndKey(1, "nokey"));
        assertTrue(ex.getMessage().contains("Flag not found"));
    }

    @Test
    void create_shouldCreateFlag() {
        Project p = new Project();
        p.setId(1);
        when(projectRepository.findById(1)).thenReturn(p);
        when(flagRepository.save(any(Flag.class))).thenAnswer(inv -> {
            Flag f = inv.getArgument(0);
            f.setId(10);
            return f;
        });

        FlagRequest req = new FlagRequest();
        req.setProjectId(1);
        req.setName("New Flag");
        req.setKey("new-flag");
        req.setFlagType("RELEASE");

        Flag result = flagService.create(req);
        assertEquals("New Flag", result.getName());
        assertEquals(FlagType.RELEASE, result.getFlagType());
    }

    @Test
    void create_shouldThrowExceptionWhenProjectNotFound() {
        when(projectRepository.findById(999)).thenReturn(null);
        FlagRequest req = new FlagRequest();
        req.setProjectId(999);
        req.setName("x");
        req.setKey("x");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> flagService.create(req));
        assertTrue(ex.getMessage().contains("Project not found"));
    }

    @Test
    void create_shouldThrowExceptionForInvalidFlagType() {
        Project p = new Project();
        p.setId(1);
        when(projectRepository.findById(1)).thenReturn(p);

        FlagRequest req = new FlagRequest();
        req.setProjectId(1);
        req.setName("Bad");
        req.setKey("bad");
        req.setFlagType("INVALID");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> flagService.create(req));
        assertTrue(ex.getMessage().contains("Invalid flag type"));
    }

    @Test
    void create_shouldCreateFlagWithTags() {
        Project p = new Project();
        p.setId(1);
        when(projectRepository.findById(1)).thenReturn(p);
        when(flagRepository.save(any(Flag.class))).thenAnswer(inv -> {
            Flag f = inv.getArgument(0);
            f.setId(10);
            return f;
        });
        when(tagRepository.findById(1)).thenReturn(new Tag());

        FlagRequest req = new FlagRequest();
        req.setProjectId(1);
        req.setName("With Tags");
        req.setKey("with-tags");
        FlagRequest.TagValue tv = new FlagRequest.TagValue();
        tv.setTagId(1);
        tv.setValue("beta");
        req.setTags(List.of(tv));

        Flag result = flagService.create(req);
        assertNotNull(result);
        verify(flagTagValueRepository).save(any(FlagTagValue.class));
    }

    @Test
    void create_shouldThrowExceptionWhenTagNotFound() {
        Project p = new Project();
        p.setId(1);
        when(projectRepository.findById(1)).thenReturn(p);
        when(flagRepository.save(any(Flag.class))).thenAnswer(inv -> {
            Flag f = inv.getArgument(0);
            f.setId(10);
            return f;
        });
        when(tagRepository.findById(999)).thenReturn(null);

        FlagRequest req = new FlagRequest();
        req.setProjectId(1);
        req.setName("Bad Tag");
        req.setKey("bad-tag");
        FlagRequest.TagValue tv = new FlagRequest.TagValue();
        tv.setTagId(999);
        tv.setValue("x");
        req.setTags(List.of(tv));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> flagService.create(req));
        assertTrue(ex.getMessage().contains("Tag not found"));
    }

    @Test
    void update_shouldUpdateFlag() {
        Flag existing = new Flag();
        existing.setId(1);
        existing.setName("Old");
        when(flagRepository.findById(1)).thenReturn(existing);
        when(flagRepository.save(any(Flag.class))).thenReturn(existing);

        FlagRequest req = new FlagRequest();
        req.setName("Updated");
        req.setKey("updated-key");
        req.setFlagType("KILLSWITCH");

        Flag result = flagService.update(1, req);
        assertEquals("Updated", result.getName());
        assertEquals(FlagType.KILLSWITCH, result.getFlagType());
    }

    @Test
    void update_shouldThrowExceptionWhenNotFound() {
        when(flagRepository.findById(999)).thenReturn(null);

        FlagRequest req = new FlagRequest();
        req.setName("x");
        req.setKey("x");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> flagService.update(999, req));
        assertTrue(ex.getMessage().contains("Flag not found"));
    }

    @Test
    void delete_shouldDeleteFlagAndTagValues() {
        doNothing().when(flagTagValueRepository).deleteByFlagId(1);
        doNothing().when(flagRepository).deleteById(1);

        flagService.delete(1);

        verify(flagTagValueRepository).deleteByFlagId(1);
        verify(flagRepository).deleteById(1);
    }

    @Test
    void archive_shouldArchiveFlag() {
        Flag flag = new Flag();
        flag.setId(1);
        flag.setName("test");
        flag.setKey("test-key");
        flag.setProjectId(1);
        when(flagRepository.findById(1)).thenReturn(flag);

        Flag result = flagService.archive(1, 99);

        assertTrue(result.isArchived());
        verify(flagRepository).setArchived(1, true, 99);
        verify(events).publish(argThat(e -> e.action().equals("flag.archived")));
    }

    @Test
    void archive_shouldThrowExceptionWhenNotFound() {
        when(flagRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> flagService.archive(999));
        assertTrue(ex.getMessage().contains("Flag not found"));
    }

    @Test
    void unarchive_shouldUnarchiveFlag() {
        Flag flag = new Flag();
        flag.setId(1);
        flag.setName("test");
        flag.setKey("test-key");
        flag.setProjectId(1);
        flag.setArchived(true);
        when(flagRepository.findById(1)).thenReturn(flag);

        Flag result = flagService.unarchive(1);

        assertFalse(result.isArchived());
        verify(flagRepository).clearArchived(1);
        verify(events).publish(argThat(e -> e.action().equals("flag.unarchived")));
    }

    @Test
    void unarchive_shouldThrowExceptionWhenNotFound() {
        when(flagRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> flagService.unarchive(999));
        assertTrue(ex.getMessage().contains("Flag not found"));
    }

    @Test
    void findByProjectIdIncludingArchived_shouldReturnAllFlags() {
        Project p = new Project();
        p.setId(1);
        when(projectRepository.findById(1)).thenReturn(p);
        when(flagRepository.findByProjectIdIncludingArchived(1)).thenReturn(List.of(new Flag()));

        List<Flag> result = flagService.findByProjectIdIncludingArchived(1);
        assertEquals(1, result.size());
    }

    @Test
    void findByProjectIdIncludingArchived_shouldThrowExceptionWhenProjectNotFound() {
        when(projectRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> flagService.findByProjectIdIncludingArchived(999));
        assertTrue(ex.getMessage().contains("Project not found"));
    }
}