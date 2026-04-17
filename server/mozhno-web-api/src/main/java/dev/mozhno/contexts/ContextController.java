package dev.mozhno.contexts;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import dev.mozhno.auth.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contexts")
@RequiredArgsConstructor
@Tag(name = "Contexts", description = "Context definitions and values for targeting")
public class ContextController {
    private final ContextService contextService;
    private final ContextAssembler contextAssembler;

    @GetMapping
    @Operation(summary = "Get all context definitions for a project")
    public List<ContextDefinitionResponse> getDefinitions(@AuthenticationPrincipal UserPrincipal user) {
        List<ContextDefinition> defs = contextService.findDefinitionsByProjectId(user.projectId());
        return contextAssembler.toDefinitionResponseList(defs);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a context definition")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public ContextDefinitionResponse createDefinition(@Valid @RequestBody ContextDefinitionRequest request,
                                                      @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(user.projectId());
        ContextDefinition def = contextService.createDefinition(request, user.email());
        return contextAssembler.toDefinitionResponse(def);
    }

    @GetMapping("/{definitionId}")
    @Operation(summary = "Get context definition by ID")
    public ContextDefinitionResponse getDefinitionById(@PathVariable Integer definitionId,
                                                       @AuthenticationPrincipal UserPrincipal user) {
        ContextDefinition def = contextService.findDefinitionById(definitionId, user.projectId());
        return contextAssembler.toDefinitionResponse(def);
    }

    @PutMapping("/{definitionId}")
    @Operation(summary = "Update a context definition")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public ContextDefinitionResponse updateDefinition(@PathVariable Integer definitionId,
                                                      @Valid @RequestBody ContextDefinitionRequest request,
                                                      @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(user.projectId());
        ContextDefinition def = contextService.updateDefinition(definitionId, request);
        return contextAssembler.toDefinitionResponse(def);
    }

    @DeleteMapping("/{definitionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a context definition")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public void deleteDefinition(@PathVariable Integer definitionId,
                                 @AuthenticationPrincipal UserPrincipal user) {
        contextService.deleteDefinition(definitionId, user.projectId());
    }

    @GetMapping("/{definitionId}/values")
    @Operation(summary = "Get all values for a context definition")
    public List<ContextValueResponse> getValues(@PathVariable Integer definitionId,
                                                @AuthenticationPrincipal UserPrincipal user) {
        List<ContextValue> values = contextService.findValuesByContextDefinitionId(definitionId, user.projectId());
        return contextAssembler.toValueResponseList(values);
    }

    @PostMapping("/{definitionId}/values")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add values to a context definition")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public ContextValueResponse createValue(@PathVariable Integer definitionId,
                                            @Valid @RequestBody ContextValueRequest request,
                                            @AuthenticationPrincipal UserPrincipal user) {
        request.setContextDefinitionId(definitionId);
        ContextValue value = contextService.createValue(request, user.projectId());
        return contextAssembler.toValueResponse(value);
    }

    @GetMapping("/values/{valueId}")
    @Operation(summary = "Get context value by ID")
    public ContextValueResponse getValueById(@PathVariable Integer valueId,
                                             @AuthenticationPrincipal UserPrincipal user) {
        ContextValue value = contextService.findValueById(valueId, user.projectId());
        return contextAssembler.toValueResponse(value);
    }

    @PutMapping("/values/{valueId}")
    @Operation(summary = "Update a context value")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public ContextValueResponse updateValue(@PathVariable Integer valueId,
                                            @Valid @RequestBody ContextValueRequest request,
                                            @AuthenticationPrincipal UserPrincipal user) {
        ContextValue value = contextService.updateValue(valueId, request, user.projectId());
        return contextAssembler.toValueResponse(value);
    }

    @DeleteMapping("/values/{valueId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a context value")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public void deleteValue(@PathVariable Integer valueId,
                            @AuthenticationPrincipal UserPrincipal user) {
        contextService.deleteValue(valueId, user.projectId());
    }
}
