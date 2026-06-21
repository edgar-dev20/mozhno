package dev.mozhno.tags;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import dev.mozhno.auth.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Tags", description = "Tag management per project")
public class TagController {
    private final TagService tagService;
    private final TagAssembler tagAssembler;

    @GetMapping
    @Operation(summary = "Get all tags for a project")
    public List<TagResponse> getAll(@AuthenticationPrincipal UserPrincipal user) {
        List<Tag> tags = tagService.findByProjectId(user.projectId());
        return tagAssembler.toResponseList(tags);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tag by ID")
    public TagResponse getById(@PathVariable Integer id,
                               @AuthenticationPrincipal UserPrincipal user) {
        Tag tag = tagService.findById(id, user.projectId());
        return tagAssembler.toResponse(tag);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a tag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER')")
    public TagResponse create(@Valid @RequestBody TagRequest request,
                              @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(user.projectId());
        Tag tag = tagService.create(request);
        return tagAssembler.toResponse(tag);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a tag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER')")
    public TagResponse update(@PathVariable Integer id,
                              @Valid @RequestBody TagRequest request,
                              @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(user.projectId());
        Tag tag = tagService.update(id, request);
        return tagAssembler.toResponse(tag);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a tag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        tagService.delete(id, user.projectId());
    }
}
