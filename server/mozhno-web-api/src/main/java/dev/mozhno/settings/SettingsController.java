package dev.mozhno.settings;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import dev.mozhno.auth.UserPrincipal;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "Project security settings")
public class SettingsController {
    private final ProjectSettingsService settingsService;
    private final SettingsAssembler settingsAssembler;

    @GetMapping
    @Operation(summary = "Get project settings")
    public ProjectSettingsResponse get(@AuthenticationPrincipal UserPrincipal user) {
        ProjectSettings settings = settingsService.getOrCreate(user.projectId());
        return settingsAssembler.toResponse(settings);
    }

    @PutMapping
    @Operation(summary = "Update project settings (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ProjectSettingsResponse update(@RequestBody ProjectSettingsUpdateRequest request,
                                          @AuthenticationPrincipal UserPrincipal user) {
        ProjectSettings settings = settingsService.update(user.projectId(), request);
        return settingsAssembler.toResponse(settings);
    }
}
