package ru.mozhno.flags;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/flags")
@RequiredArgsConstructor
@Tag(name = "Flags", description = "Feature flag management")
public class FlagController {
    private final FlagService flagService;
    private final FlagTagValueRepository flagTagValueRepository;

    @GetMapping
    @Operation(summary = "Get all flags for a project")
    public List<FlagResponse> getAll(@PathVariable Integer projectId) {
        List<Flag> flags = flagService.findByProjectId(projectId);
        return flags.stream()
                .map(f -> new FlagResponse(f, flagTagValueRepository.findByFlagId(f.getId())))
                .toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get flag by ID")
    public FlagResponse getById(@PathVariable Integer projectId, @PathVariable Integer id) {
        Flag flag = flagService.findById(id);
        return new FlagResponse(flag, flagTagValueRepository.findByFlagId(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new flag")
    public FlagResponse create(@PathVariable Integer projectId, @RequestBody FlagRequest request) {
        request.setProjectId(projectId);
        Flag flag = flagService.create(request);
        return new FlagResponse(flag, flagTagValueRepository.findByFlagId(flag.getId()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a flag")
    public FlagResponse update(@PathVariable Integer projectId, @PathVariable Integer id, @RequestBody FlagRequest request) {
        Flag flag = flagService.update(id, request);
        return new FlagResponse(flag, flagTagValueRepository.findByFlagId(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a flag")
    public void delete(@PathVariable Integer id) {
        flagService.delete(id);
    }
}