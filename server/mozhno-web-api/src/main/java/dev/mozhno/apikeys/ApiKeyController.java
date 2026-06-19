package dev.mozhno.apikeys;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
@RequestMapping("/api/v1/api-keys")
@RequiredArgsConstructor
@Tag(name = "API Keys", description = "API key management for client SDK access")
public class ApiKeyController {
    private final ApiKeyService apiKeyService;
    private final ApiKeyAssembler apiKeyAssembler;

    @GetMapping
    @Operation(summary = "Get all API keys for a project")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of API keys",
            content = @Content(schema = @Schema(implementation = ApiKeyResponse.class)))
    })
    public List<ApiKeyResponse> getAll(@AuthenticationPrincipal UserPrincipal user) {
        List<ApiKey> keys = apiKeyService.findByProjectId(user.projectId());
        return apiKeyAssembler.toResponseList(keys);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get API key by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "API key details",
            content = @Content(schema = @Schema(implementation = ApiKeyResponse.class))),
        @ApiResponse(responseCode = "404", description = "API key not found")
    })
    public ApiKeyResponse getById(@PathVariable Integer id,
                                  @AuthenticationPrincipal UserPrincipal user) {
        ApiKey key = apiKeyService.findById(id, user.projectId());
        return apiKeyAssembler.toResponse(key);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new API key for a project")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "API key created successfully",
            content = @Content(schema = @Schema(implementation = ApiKeyResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ApiKeyResponse create(@Valid @RequestBody ApiKeyRequest request,
                                 @AuthenticationPrincipal UserPrincipal user) {
        ApiKey key = apiKeyService.create(user.projectId(), request);
        return apiKeyAssembler.toResponse(key);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an API key (name, environment, description)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "API key updated",
            content = @Content(schema = @Schema(implementation = ApiKeyResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ApiKeyResponse update(@PathVariable Integer id,
                                 @Valid @RequestBody ApiKeyRequest request,
                                 @AuthenticationPrincipal UserPrincipal user) {
        ApiKey key = apiKeyService.update(id, request, user.projectId());
        return apiKeyAssembler.toResponse(key);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an API key")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        apiKeyService.delete(id, user.projectId());
    }
}
