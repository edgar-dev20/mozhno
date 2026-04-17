package dev.mozhno.contexts;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.Instant;

@Schema(description = "Context definition describing a targeting attribute")
@Builder
public record ContextDefinitionResponse(
    @Schema(description = "Unique identifier")
    Integer id,
    @Schema(description = "Human-readable name", example = "Country")
    String name,
    @Schema(description = "Machine-friendly key used in SDKs", example = "country")
    @JsonProperty("key")
    String contextKey,
    @Schema(description = "Data type of the context value", example = "string")
    @JsonProperty("type")
    String contextType,
    @Schema(description = "Username of the creator")
    String createdBy,
    @Schema(description = "Optional description", nullable = true)
    String description,
    @Schema(description = "Project ID")
    Integer projectId,
    @Schema(description = "When the context definition was created")
    Instant createdAt
) {}
