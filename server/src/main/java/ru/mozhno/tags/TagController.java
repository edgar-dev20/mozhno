package ru.mozhno.tags;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/tags")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Tags", description = "Tag management per project")
public class TagController {
    private final TagService tagService;

    @GetMapping
    @Operation(summary = "Get all tags for a project")
    public List<Tag> getAll(@PathVariable Integer projectId) {
        return tagService.findByProjectId(projectId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tag by ID")
    public Tag getById(@PathVariable Integer projectId, @PathVariable Integer id) {
        return tagService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a tag")
    public Tag create(@PathVariable Integer projectId, @RequestBody TagRequest request) {
        request.setProjectId(projectId);
        return tagService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a tag")
    public Tag update(@PathVariable Integer id, @RequestBody TagRequest request) {
        return tagService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a tag")
    public void delete(@PathVariable Integer id) {
        tagService.delete(id);
    }
}