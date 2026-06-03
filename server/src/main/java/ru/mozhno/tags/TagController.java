package ru.mozhno.tags;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.auth.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/tags")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Tags", description = "Tag management per project")
public class TagController {
    private final TagService tagService;

    @GetMapping
    @Operation(summary = "Get all tags for a project")
    public List<Tag> getAll(@PathVariable Integer projectId,
                            @AuthenticationPrincipal UserPrincipal user) {
        return tagService.findByProjectId(projectId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tag by ID")
    public Tag getById(@PathVariable Integer projectId, @PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        return tagService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a tag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public Tag create(@PathVariable Integer projectId, @Valid @RequestBody TagRequest request,
                      @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(projectId);
        return tagService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a tag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public Tag update(@PathVariable Integer id, @Valid @RequestBody TagRequest request,
                      @AuthenticationPrincipal UserPrincipal user) {
        return tagService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a tag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        tagService.delete(id);
    }
}