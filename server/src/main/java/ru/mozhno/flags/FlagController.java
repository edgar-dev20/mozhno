package ru.mozhno.flags;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.tags.Tag;
import ru.mozhno.tags.TagRepository;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/flags")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Flags", description = "Feature flag management")
public class FlagController {
    private final FlagService flagService;
    private final FlagTagValueRepository flagTagValueRepository;
    private final TagRepository tagRepository;

    public FlagController(FlagService flagService, FlagTagValueRepository flagTagValueRepository, TagRepository tagRepository) {
        this.flagService = flagService;
        this.flagTagValueRepository = flagTagValueRepository;
        this.tagRepository = tagRepository;
    }

    @GetMapping
    @Operation(summary = "Get all flags for a project")
    public List<FlagResponse> getAll(@PathVariable Integer projectId) {
        List<Flag> flags = flagService.findByProjectId(projectId);
        return flags.stream()
                .map(f -> toResponse(f))
                .toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get flag by ID")
    public FlagResponse getById(@PathVariable Integer projectId, @PathVariable Integer id) {
        Flag flag = flagService.findById(id);
        return toResponse(flag);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new flag")
    public FlagResponse create(@PathVariable Integer projectId, @RequestBody FlagRequest request) {
        request.setProjectId(projectId);
        Flag flag = flagService.create(request);
        return toResponse(flag);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a flag")
    public FlagResponse update(@PathVariable Integer projectId, @PathVariable Integer id, @RequestBody FlagRequest request) {
        Flag flag = flagService.update(id, request);
        return toResponse(flag);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a flag")
    public void delete(@PathVariable Integer id) {
        flagService.delete(id);
    }

    private FlagResponse toResponse(Flag flag) {
        List<FlagTagValue> tagValues = flagTagValueRepository.findByFlagId(flag.getId());
        List<FlagResponse.TagValueResponse> tags = tagValues.stream().map(ftv -> {
            ru.mozhno.tags.Tag tag = tagRepository.findById(ftv.getTagId());
            return new FlagResponse.TagValueResponse(
                    ftv.getTagId(),
                    tag != null ? tag.getName() : "",
                    tag != null ? tag.getColor() : "",
                    ftv.getTagValue()
            );
        }).toList();
        return new FlagResponse(
                flag.getId(),
                flag.getProjectId(),
                flag.getName(),
                flag.getKey(),
                flag.getDescription(),
                flag.getFlagType() != null ? flag.getFlagType().name() : "RELEASE",
                flag.getCreatedAt(),
                tags
        );
    }
}