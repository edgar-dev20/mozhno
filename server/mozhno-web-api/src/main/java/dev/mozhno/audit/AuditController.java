package dev.mozhno.audit;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import dev.mozhno.auth.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@Tag(name = "Audit Log", description = "Audit event log")
public class AuditController {
    private final AuditService auditService;
    private final AuditAssembler auditAssembler;

    @GetMapping
    @Operation(summary = "Get paginated audit log for a project")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'VIEWER')")
    public List<AuditEventResponse> getAll(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "50") int size,
                                           @RequestParam(required = false) String dateFrom,
                                           @RequestParam(required = false) String dateTo,
                                           @AuthenticationPrincipal UserPrincipal user) {
        List<AuditEvent> events = auditService.findByProjectId(user.projectId(), page, size, dateFrom, dateTo);
        return auditAssembler.toResponseList(events);
    }
}
