package ru.mozhno.apikeys;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/api-keys")
@RequiredArgsConstructor
@Tag(name = "API Keys", description = "API key management for client SDK access")
public class ApiKeyController {
    private final ApiKeyService apiKeyService;

    @GetMapping
    @Operation(summary = "Get all API keys for a project")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of API keys",
            content = @Content(schema = @Schema(implementation = ApiKey.class)))
    })
    public List<ApiKey> getAll(@PathVariable Integer projectId) {
        return apiKeyService.findByProjectId(projectId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get API key by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "API key details",
            content = @Content(schema = @Schema(implementation = ApiKey.class))),
        @ApiResponse(responseCode = "404", description = "API key not found")
    })
    public ApiKey getById(@PathVariable Integer id) {
        return apiKeyService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new API key for a project")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "API key created successfully",
            content = @Content(schema = @Schema(implementation = ApiKey.class)))
    })
    public ApiKey create(@PathVariable Integer projectId, @RequestBody ApiKeyRequest request) {
        return apiKeyService.create(projectId, request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an API key (name, environment, description)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "API key updated",
            content = @Content(schema = @Schema(implementation = ApiKey.class)))
    })
    public ApiKey update(@PathVariable Integer id, @RequestBody ApiKeyRequest request) {
        return apiKeyService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an API key")
    public void delete(@PathVariable Integer id) {
        apiKeyService.delete(id);
    }
}