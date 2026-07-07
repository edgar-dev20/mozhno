package dev.mozhno.overview;

import dev.mozhno.auth.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/overview")
@RequiredArgsConstructor
@Tag(name = "Overview", description = "Home dashboard aggregates")
public class OverviewController {

    private final OverviewService overviewService;
    private final OverviewAssembler overviewAssembler;

    @GetMapping
    @Operation(summary = "Aggregated home overview for the current project")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'VIEWER')")
    public OverviewResponse get(@AuthenticationPrincipal UserPrincipal user) {
        return overviewAssembler.toResponse(overviewService.build(user.projectId()));
    }
}
