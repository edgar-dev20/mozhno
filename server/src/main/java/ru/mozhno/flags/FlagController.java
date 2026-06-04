package ru.mozhno.flags;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.auth.UserPrincipal;
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
    public List<FlagResponse> getAll(@PathVariable Integer projectId,
                                     @RequestParam(required = false) Integer environmentId,
                                     @AuthenticationPrincipal UserPrincipal user) {
        List<Flag> flags;
        if (environmentId != null) {
            flags = flagService.findByProjectIdWithStrategyForEnvironment(projectId, environmentId);
            return flags.stream()
                    .map(f -> toResponse(f, f.getStrategy()))
                    .toList();
        } else {
            flags = flagService.findByProjectId(projectId);
            return flags.stream()
                    .map(this::toResponse)
                    .toList();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get flag by ID")
    public FlagResponse getById(@PathVariable Integer projectId, @PathVariable Integer id,
                                @AuthenticationPrincipal UserPrincipal user) {
        Flag flag = flagService.findById(id);
        return toResponse(flag);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new flag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public FlagResponse create(@PathVariable Integer projectId, @Valid @RequestBody FlagRequest request,
                               @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(projectId);
        Flag flag = flagService.create(request);
        return toResponse(flag);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a flag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public FlagResponse update(@PathVariable Integer projectId, @PathVariable Integer id,
                               @Valid @RequestBody FlagRequest request,
                               @AuthenticationPrincipal UserPrincipal user) {
        Flag flag = flagService.update(id, request);
        return toResponse(flag);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a flag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        flagService.delete(id);
    }

    private FlagResponse toResponse(Flag flag, ru.mozhno.flags.strategy.FlagStrategy strategy) {
        List<FlagTagValue> tagValues = flagTagValueRepository.findByFlagId(flag.getId());
        List<FlagResponse.TagValueResponse> tags = tagValues.stream().map(ftv -> {
            Tag tag = tagRepository.findById(ftv.getTagId());
            return new FlagResponse.TagValueResponse(
                    ftv.getTagId(),
                    tag != null ? tag.getName() : "",
                    tag != null ? tag.getColor() : "",
                    ftv.getTagValue()
            );
        }).toList();
        boolean enabled = strategy != null ? strategy.isEnabled() : flag.isEnabled();
        Integer strategyId = strategy != null ? strategy.getId() : null;
        Double percentage = strategy != null ? strategy.getPercentage() : null;
        Integer contextDefinitionId = strategy != null ? strategy.getContextDefinitionId() : null;
        String contextValuesJson = strategy != null ? strategy.getContextValuesJson() : null;
        List<Integer> segmentIds = strategy != null ? strategy.getSegmentIds() : null;
        return new FlagResponse(
                flag.getId(),
                flag.getProjectId(),
                flag.getName(),
                flag.getKey(),
                flag.getDescription(),
                flag.getFlagType() != null ? flag.getFlagType().name() : "RELEASE",
                flag.getCreatedAt(),
                tags,
                enabled,
                strategyId,
                percentage,
                contextDefinitionId,
                contextValuesJson,
                segmentIds
        );
    }

    private FlagResponse toResponse(Flag flag) {
        return toResponse(flag, null);
    }
}