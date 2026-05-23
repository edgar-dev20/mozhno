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

    @GetMapping
    @Operation(summary = "Get all flags for a project")
    public List<Flag> getAll(@PathVariable Integer projectId) {
        return flagService.findByProjectId(projectId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get flag by ID")
    public Flag getById(@PathVariable Integer projectId, @PathVariable Integer id) {
        return flagService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new flag")
    public Flag create(@PathVariable Integer projectId, @RequestBody FlagRequest request) {
        request.setProjectId(projectId);
        return flagService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a flag")
    public Flag update(@PathVariable Integer projectId, @PathVariable Integer id, @RequestBody FlagRequest request) {
        return flagService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a flag")
    public void delete(@PathVariable Integer id) {
        flagService.delete(id);
    }
}