package dev.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.tags.Tag;
import dev.mozhno.tags.TagRepository;
import dev.mozhno.tags.TagRequest;
import dev.mozhno.tags.TagService;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TagServiceTest {

    @Mock
    private TagRepository tagRepository;

    @Mock
    private DomainEventPublisher events;

    private TagService tagService;

    @BeforeEach
    void setUp() {
        tagService = new TagService(tagRepository, events);
    }

    @Test
    void findByProjectId_shouldReturnTags() {
        Tag t = new Tag();
        t.setId(1);
        t.setName("release");
        when(tagRepository.findByProjectId(1)).thenReturn(List.of(t));

        List<Tag> result = tagService.findByProjectId(1);
        assertEquals(1, result.size());
    }

    @Test
    void findById_shouldReturnTag() {
        Tag t = new Tag();
        t.setId(1);
        t.setName("beta");
        when(tagRepository.findById(1)).thenReturn(t);

        Tag result = tagService.findById(1, null);
        assertEquals("beta", result.getName());
    }

    @Test
    void findById_shouldThrowExceptionWhenNotFound() {
        when(tagRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> tagService.findById(999, null));
        assertTrue(ex.getMessage().contains("Tag not found"));
    }

    @Test
    void create_shouldCreateAndReturn() {
        TagRequest req = new TagRequest();
        req.setProjectId(1);
        req.setName("stable");
        req.setColor("#00FF00");

        when(tagRepository.save(any(Tag.class))).thenAnswer(inv -> {
            Tag t = inv.getArgument(0);
            t.setId(1);
            return t;
        });

        Tag result = tagService.create(req);
        assertEquals("stable", result.getName());
        assertEquals("#00FF00", result.getColor());
    }

    @Test
    void update_shouldUpdateAndReturn() {
        Tag existing = new Tag();
        existing.setId(1);
        existing.setName("old");
        when(tagRepository.findById(1)).thenReturn(existing);
        when(tagRepository.save(any(Tag.class))).thenReturn(existing);

        TagRequest req = new TagRequest();
        req.setName("updated");
        req.setColor("#000000");

        Tag result = tagService.update(1, req);
        assertEquals("updated", result.getName());
        verify(tagRepository).findById(1);
    }

    @Test
    void delete_shouldCallRepository() {
        Tag tag = new Tag();
        when(tagRepository.findById(1)).thenReturn(tag);
        when(tagRepository.deleteById(anyInt(), any())).thenReturn(1);
        tagService.delete(1, null);
        verify(tagRepository).deleteById(eq(1), any());
    }
}
