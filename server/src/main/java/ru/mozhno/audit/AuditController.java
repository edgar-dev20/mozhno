package ru.mozhno.audit;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.auth.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Audit Log", description = "Audit event log")
public class AuditController {
    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    @Operation(summary = "Get audit log for a project")
    public List<AuditEvent> getAll(@RequestParam Integer projectId,
                                   @AuthenticationPrincipal UserPrincipal user) {
        return auditService.findByProjectId(projectId);
    }
}