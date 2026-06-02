package ru.mozhno.contexts;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/contexts")
@RequiredArgsConstructor
@Tag(name = "Contexts", description = "Context definitions and values for targeting")
public class ContextController {
    private final ContextService contextService;

    @GetMapping
    @Operation(summary = "Get all context definitions for a project")
    public List<ContextDefinition> getDefinitions(@PathVariable Integer projectId) {
        return contextService.findDefinitionsByProjectId(projectId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a context definition")
    public ContextDefinition createDefinition(@PathVariable Integer projectId, @Valid @RequestBody ContextDefinitionRequest request) {
        request.setProjectId(projectId);
        return contextService.createDefinition(request);
    }

    @GetMapping("/{definitionId}")
    @Operation(summary = "Get context definition by ID")
    public ContextDefinition getDefinitionById(@PathVariable Integer definitionId) {
        return contextService.findDefinitionById(definitionId);
    }

    @PutMapping("/{definitionId}")
    @Operation(summary = "Update a context definition")
    public ContextDefinition updateDefinition(@PathVariable Integer definitionId, @Valid @RequestBody ContextDefinitionRequest request) {
        return contextService.updateDefinition(definitionId, request);
    }

    @DeleteMapping("/{definitionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a context definition")
    public void deleteDefinition(@PathVariable Integer definitionId) {
        contextService.deleteDefinition(definitionId);
    }

    @GetMapping("/{definitionId}/values")
    @Operation(summary = "Get all values for a context definition")
    public List<ContextValue> getValues(@PathVariable Integer definitionId) {
        return contextService.findValuesByContextDefinitionId(definitionId);
    }

    @PostMapping("/{definitionId}/values")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add values to a context definition")
    public ContextValue createValue(@PathVariable Integer definitionId, @Valid @RequestBody ContextValueRequest request) {
        request.setContextDefinitionId(definitionId);
        return contextService.createValue(request);
    }

    @GetMapping("/values/{valueId}")
    @Operation(summary = "Get context value by ID")
    public ContextValue getValueById(@PathVariable Integer valueId) {
        return contextService.findValueById(valueId);
    }

    @PutMapping("/values/{valueId}")
    @Operation(summary = "Update a context value")
    public ContextValue updateValue(@PathVariable Integer valueId, @Valid @RequestBody ContextValueRequest request) {
        return contextService.updateValue(valueId, request);
    }

    @DeleteMapping("/values/{valueId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a context value")
    public void deleteValue(@PathVariable Integer valueId) {
        contextService.deleteValue(valueId);
    }
}