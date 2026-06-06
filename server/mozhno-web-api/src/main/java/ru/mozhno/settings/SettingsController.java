package ru.mozhno.settings;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.auth.UserPrincipal;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/settings")
@Tag(name = "Settings", description = "Project security settings")
public class SettingsController {
    private final ProjectSettingsService settingsService;

    public SettingsController(ProjectSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    @Operation(summary = "Get project settings")
    public ProjectSettings get(@PathVariable Integer projectId,
                               @AuthenticationPrincipal UserPrincipal user) {
        return settingsService.getOrCreate(projectId);
    }

    @PutMapping
    @Operation(summary = "Update project settings (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ProjectSettings update(@PathVariable Integer projectId,
                                  @RequestBody ProjectSettingsUpdateRequest request,
                                  @AuthenticationPrincipal UserPrincipal user) {
        return settingsService.update(projectId, request);
    }
}