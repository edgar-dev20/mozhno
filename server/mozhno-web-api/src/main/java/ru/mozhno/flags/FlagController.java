package ru.mozhno.flags;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.auth.UserPrincipal;
import ru.mozhno.auth.UserRepository;
import ru.mozhno.tags.Tag;
import ru.mozhno.tags.TagRepository;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/flags")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Flags", description = "Feature flag management")
public class FlagController {
    private final FlagService flagService;
    private final FlagTagValueRepository flagTagValueRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    public FlagController(FlagService flagService, FlagTagValueRepository flagTagValueRepository, TagRepository tagRepository, UserRepository userRepository) {
        this.flagService = flagService;
        this.flagTagValueRepository = flagTagValueRepository;
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Get all flags for a project")
    public List<FlagResponse> getAll(@PathVariable Integer projectId,
                                     @RequestParam(required = false) Integer environmentId,
                                     @RequestParam(required = false, defaultValue = "false") boolean includeArchived,
                                     @AuthenticationPrincipal UserPrincipal user) {
        List<Flag> flags;
        if (environmentId != null) {
            flags = flagService.findByProjectIdWithStrategyForEnvironment(projectId, environmentId);
            return flags.stream()
                    .map(f -> toResponse(f, f.getStrategy()))
                    .toList();
        } else if (includeArchived) {
            flags = flagService.findByProjectIdIncludingArchived(projectId);
        } else {
            flags = flagService.findByProjectId(projectId);
        }
        return flags.stream()
                .map(this::toResponse)
                .toList();
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
        Flag flag = flagService.create(request, user.userId());
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

    @PostMapping("/{id}/archive")
    @Operation(summary = "Archive a flag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public FlagResponse archive(@PathVariable Integer projectId, @PathVariable Integer id,
                                @AuthenticationPrincipal UserPrincipal user) {
        Flag flag = flagService.archive(id, user.userId());
        return toResponse(flag);
    }

    @PostMapping("/{id}/unarchive")
    @Operation(summary = "Unarchive a flag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public FlagResponse unarchive(@PathVariable Integer projectId, @PathVariable Integer id,
                                  @AuthenticationPrincipal UserPrincipal user) {
        Flag flag = flagService.unarchive(id);
        return toResponse(flag);
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
        Instant lastUsedAt = strategy != null ? strategy.getLastUsedAt() : null;
        String createdBy = null;
        if (flag.getCreatorId() != null) {
            var creator = userRepository.findById(flag.getCreatorId());
            if (creator != null) {
                String name = creator.getName() != null ? creator.getName() : creator.getEmail();
                createdBy = name + " (" + creator.getEmail() + ")";
            }
        }
        String archivedBy = null;
        if (flag.getArchivedBy() != null) {
            var archiver = userRepository.findById(flag.getArchivedBy());
            if (archiver != null) {
                String name = archiver.getName() != null ? archiver.getName() : archiver.getEmail();
                archivedBy = name + " (" + archiver.getEmail() + ")";
            }
        }
        return new FlagResponse(
                flag.getId(),
                flag.getProjectId(),
                flag.getName(),
                flag.getKey(),
                flag.getDescription(),
                flag.getFlagType() != null ? flag.getFlagType().name() : "RELEASE",
                flag.getCreatedAt(),
                createdBy,
                lastUsedAt,
                archivedBy,
                flag.getArchivedAt(),
                tags,
                enabled,
                strategyId,
                percentage,
                contextDefinitionId,
                contextValuesJson,
                segmentIds,
                flag.isArchived()
        );
    }

    private FlagResponse toResponse(Flag flag) {
        return toResponse(flag, null);
    }
}