package ru.mozhno.contexts;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.auth.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/contexts")
@RequiredArgsConstructor
@Tag(name = "Contexts", description = "Context definitions and values for targeting")
public class ContextController {
    private final ContextService contextService;

    @GetMapping
    @Operation(summary = "Get all context definitions for a project")
    public List<ContextDefinition> getDefinitions(@PathVariable Integer projectId,
                                                   @AuthenticationPrincipal UserPrincipal user) {
        return contextService.findDefinitionsByProjectId(projectId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a context definition")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public ContextDefinition createDefinition(@PathVariable Integer projectId,
                                               @Valid @RequestBody ContextDefinitionRequest request,
                                               @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(projectId);
        return contextService.createDefinition(request);
    }

    @GetMapping("/{definitionId}")
    @Operation(summary = "Get context definition by ID")
    public ContextDefinition getDefinitionById(@PathVariable Integer definitionId,
                                                @AuthenticationPrincipal UserPrincipal user) {
        return contextService.findDefinitionById(definitionId);
    }

    @PutMapping("/{definitionId}")
    @Operation(summary = "Update a context definition")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public ContextDefinition updateDefinition(@PathVariable Integer definitionId,
                                               @Valid @RequestBody ContextDefinitionRequest request,
                                               @AuthenticationPrincipal UserPrincipal user) {
        return contextService.updateDefinition(definitionId, request);
    }

    @DeleteMapping("/{definitionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a context definition")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public void deleteDefinition(@PathVariable Integer definitionId,
                                  @AuthenticationPrincipal UserPrincipal user) {
        contextService.deleteDefinition(definitionId);
    }

    @GetMapping("/{definitionId}/values")
    @Operation(summary = "Get all values for a context definition")
    public List<ContextValue> getValues(@PathVariable Integer definitionId,
                                        @AuthenticationPrincipal UserPrincipal user) {
        return contextService.findValuesByContextDefinitionId(definitionId);
    }

    @PostMapping("/{definitionId}/values")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add values to a context definition")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public ContextValue createValue(@PathVariable Integer definitionId,
                                     @Valid @RequestBody ContextValueRequest request,
                                     @AuthenticationPrincipal UserPrincipal user) {
        request.setContextDefinitionId(definitionId);
        return contextService.createValue(request);
    }

    @GetMapping("/values/{valueId}")
    @Operation(summary = "Get context value by ID")
    public ContextValue getValueById(@PathVariable Integer valueId,
                                     @AuthenticationPrincipal UserPrincipal user) {
        return contextService.findValueById(valueId);
    }

    @PutMapping("/values/{valueId}")
    @Operation(summary = "Update a context value")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public ContextValue updateValue(@PathVariable Integer valueId,
                                     @Valid @RequestBody ContextValueRequest request,
                                     @AuthenticationPrincipal UserPrincipal user) {
        return contextService.updateValue(valueId, request);
    }

    @DeleteMapping("/values/{valueId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a context value")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public void deleteValue(@PathVariable Integer valueId,
                             @AuthenticationPrincipal UserPrincipal user) {
        contextService.deleteValue(valueId);
    }
}